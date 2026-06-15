import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_theme.dart';
import 'campus_data.dart';

class LocationPickerMap extends StatefulWidget {
  final double initialLat;
  final double initialLon;

  const LocationPickerMap({
    super.key,
    this.initialLat = -6.973, // Default: Telkom University
    this.initialLon = 107.630,
  });

  @override
  State<LocationPickerMap> createState() => _LocationPickerMapState();
}

class _LocationPickerMapState extends State<LocationPickerMap> {
  late final MapController _mapController;
  LatLng _currentCenter = const LatLng(-6.973, 107.630);
  String _currentAddress = 'Mencari lokasi...';
  bool _isLoadingAddress = false;
  Timer? _debounce;
  final TextEditingController _searchController = TextEditingController();
  List<dynamic> _searchResults = [];
  bool _isSearching = false;
  bool _isOutOfBounds = false;
  bool _addressFromSearch = false; // Flag: jika true, jangan timpa dengan reverse geocoding

  // Polygon area kampus Telkom University - diplot manual via geojson.io
  // Format GeoJSON [lon, lat] dikonversi ke LatLng(lat, lon)
  final List<LatLng> _campusPolygon = const [
    LatLng(-6.9695897, 107.6275403),
    LatLng(-6.9702027, 107.6267752),
    LatLng(-6.9712490, 107.6267362),
    LatLng(-6.9714534, 107.6284715),
    LatLng(-6.9741844, 107.6280983),
    LatLng(-6.9752099, 107.6290414),
    LatLng(-6.9777051, 107.6291008),
    LatLng(-6.9777666, 107.6312459),
    LatLng(-6.9761302, 107.6329308),
    LatLng(-6.9755606, 107.6329790),
    LatLng(-6.9749774, 107.6325453),
    LatLng(-6.9740587, 107.6326177),
    LatLng(-6.9726347, 107.6340027),
    LatLng(-6.9723228, 107.6338151),
    LatLng(-6.9721773, 107.6335744),
    LatLng(-6.9720875, 107.6335438),
    LatLng(-6.9702879, 107.6309705),
    LatLng(-6.9697506, 107.6306905),
    LatLng(-6.9692156, 107.6285563),
    LatLng(-6.9684695, 107.6284164),
    LatLng(-6.9684866, 107.6279922),
    LatLng(-6.9684866, 107.6275790),
    LatLng(-6.9695640, 107.6277267),
  ];

  // Algoritma Ray-Casting untuk menentukan apakah sebuah titik ada di dalam polygon
  bool _isPointInPolygon(LatLng point, List<LatLng> polygon) {
    int i, j = polygon.length - 1;
    bool oddNodes = false;

    for (i = 0; i < polygon.length; i++) {
      if ((polygon[i].latitude < point.latitude && polygon[j].latitude >= point.latitude || 
           polygon[j].latitude < point.latitude && polygon[i].latitude >= point.latitude) && 
          (polygon[i].longitude <= point.longitude || polygon[j].longitude <= point.longitude)) {
        
        if (polygon[i].longitude + (point.latitude - polygon[i].latitude) / (polygon[j].latitude - polygon[i].latitude) * (polygon[j].longitude - polygon[i].longitude) < point.longitude) {
          oddNodes = !oddNodes;
        }
      }
      j = i;
    }
    return oddNodes;
  }  // Cek apakah pin berada di dalam salah satu polygon gedung
  String? _findContainingLocation(LatLng point) {
    for (final loc in CampusData.campusLocations) {
      final List<dynamic> rawPolygon = loc['polygon'] as List<dynamic>;
      final List<LatLng> polygon = rawPolygon
          .map((p) => LatLng((p['lat'] as double), (p['lon'] as double)))
          .toList();
      if (_isPointInPolygon(point, polygon)) {
        return loc['name'] as String;
      }
    }
    return null;
  }

  // Bangun daftar polygon gedung untuk ditampilkan di peta
  List<Polygon> _buildBuildingPolygons() {
    return CampusData.campusLocations.map((loc) {
      final List<dynamic> rawPolygon = loc['polygon'] as List<dynamic>;
      final List<LatLng> points = rawPolygon
          .map((p) => LatLng((p['lat'] as double), (p['lon'] as double)))
          .toList();
      return Polygon(
        points: points,
        color: AppColors.primary.withValues(alpha: 0.08),
        borderColor: AppColors.primary.withValues(alpha: 0.4),
        borderStrokeWidth: 1.5,
      );
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _currentCenter = LatLng(widget.initialLat, widget.initialLon);
    _mapController = MapController();
    _isOutOfBounds = !_isPointInPolygon(_currentCenter, _campusPolygon);
    _getAddressFromLatLng(_currentCenter);
  }

  @override
  void dispose() {
    _mapController.dispose();
    _debounce?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _getAddressFromLatLng(LatLng position) async {
    if (_isOutOfBounds) {
      if (mounted) setState(() => _currentAddress = 'Di luar area kampus');
      return;
    }
    if (_addressFromSearch) return;

    // PRIORITAS 1: Cek polygon gedung lokal terlebih dahulu
    final String? localName = _findContainingLocation(position);
    if (localName != null) {
      if (mounted) setState(() => _currentAddress = localName);
      return;
    }

    // PRIORITAS 2: Fallback ke Nominatim jika tidak ada di database lokal
    setState(() => _isLoadingAddress = true);
    try {
      final url = Uri.parse(
          'https://nominatim.openstreetmap.org/reverse?lat=${position.latitude}&lon=${position.longitude}&format=jsonv2&addressdetails=1&namedetails=1&zoom=19');
      final response = await http.get(url, headers: {
        'User-Agent': 'CampusFix-App/1.0 (Telkom University)',
        'Accept-Language': 'id-ID,id;q=0.9',
      }).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data != null) {
          String address;
          final String directName = data['name'] ?? '';
          if (directName.isNotEmpty) {
            address = directName;
          } else {
            final String displayName = data['display_name'] ?? 'Lokasi tidak diketahui';
            final List<String> parts = displayName.split(', ');
            address = parts.take(3).join(', ');
          }
          if (mounted) setState(() => _currentAddress = address);
        } else {
          if (mounted) setState(() => _currentAddress = 'Lokasi tidak diketahui');
        }
      } else {
        if (mounted) setState(() => _currentAddress = 'Gagal memuat (Error ${response.statusCode})');
      }
    } catch (e) {
      debugPrint('Error reverse geocoding: $e');
      if (mounted) setState(() => _currentAddress = 'Gagal mendapatkan alamat');
    } finally {
      if (mounted) setState(() => _isLoadingAddress = false);
    }
  }

  Future<void> _searchPlaces(String query) async {
    if (query.trim().isEmpty) {
      setState(() {
        _searchResults = [];
        _isSearching = false;
      });
      return;
    }

    setState(() => _isSearching = true);
    try {
      // Gunakan viewbox tepat sesuai bounding box polygon kampus
      final url = Uri.parse(
          'https://nominatim.openstreetmap.org/search?q=${Uri.encodeComponent(query)}&format=jsonv2&addressdetails=1&countrycodes=id&viewbox=107.6267362,-6.9684695,107.6340027,-6.9777666&bounded=1&limit=5');
      final response = await http.get(url, headers: {
        'User-Agent': 'CampusFix-App/1.0 (Telkom University)',
        'Accept-Language': 'id-ID,id;q=0.9',
      }).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (mounted) {
          setState(() {
            _searchResults = (decoded is List) ? decoded : [];
          });
        }
      } else {
        debugPrint('Search API Error: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error searching places: $e');
    } finally {
      if (mounted) setState(() => _isSearching = false);
    }
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoadingAddress = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw 'Layanan lokasi tidak aktif.';
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) throw 'Izin lokasi ditolak.';
      }

      if (permission == LocationPermission.deniedForever) {
        throw 'Izin lokasi ditolak permanen.';
      }

      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final newCenter = LatLng(position.latitude, position.longitude);
      _mapController.move(newCenter, 17.0);
      _currentCenter = newCenter;
      
      final outOfBounds = !_isPointInPolygon(_currentCenter, _campusPolygon);
      if (_isOutOfBounds != outOfBounds) {
        setState(() => _isOutOfBounds = outOfBounds);
      }
      
      await _getAddressFromLatLng(newCenter);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoadingAddress = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // 1. Map Layer
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentCenter,
              initialZoom: 16.0,
              maxZoom: 19.0,
              minZoom: 15.0,
              onPositionChanged: (position, hasGesture) {
                if (hasGesture && position.center != null) {
                  _currentCenter = position.center;
                  // Saat user mulai drag, reset flag search agar reverse geocoding aktif kembali
                  _addressFromSearch = false;
                  
                  final outOfBounds = !_isPointInPolygon(_currentCenter, _campusPolygon);
                  if (_isOutOfBounds != outOfBounds) {
                    setState(() => _isOutOfBounds = outOfBounds);
                  }

                  if (!outOfBounds) {
                    if (_debounce?.isActive ?? false) _debounce!.cancel();
                    _debounce = Timer(const Duration(milliseconds: 800), () {
                      _getAddressFromLatLng(_currentCenter);
                    });
                  } else {
                    setState(() => _currentAddress = 'Di luar area kampus');
                  }
                }
              },
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.campusfix',
              ),
              // Batas kampus (merah tipis)
              PolygonLayer(
                polygons: [
                  Polygon(
                    points: _campusPolygon,
                    color: Colors.transparent,
                    borderColor: AppColors.danger.withValues(alpha: 0.6),
                    borderStrokeWidth: 2.0,
                  ),
                ],
              ),
              // Polygon per gedung (biru tipis, dari database lokal)
              PolygonLayer(
                polygons: _buildBuildingPolygons(),
              ),
            ],
          ),

          // 2. Center Pin (Fixed in middle)
          Center(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 40.0), // Offset to align tip of pin
              child: const Icon(
                Icons.location_on,
                size: 40,
                color: AppColors.danger,
              ),
            ),
          ),

          // 3. Top Search Bar & Back Button
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: isDark ? AppColors.bgDark : Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                        ),
                        child: IconButton(
                          icon: const Icon(Icons.arrow_back),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.bgDark : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                          ),
                          child: TextField(
                            controller: _searchController,
                            onChanged: (val) {
                              if (_debounce?.isActive ?? false) _debounce!.cancel();
                              _debounce = Timer(const Duration(milliseconds: 500), () {
                                _searchPlaces(val);
                              });
                            },
                            decoration: InputDecoration(
                              hintText: 'Cari gedung atau lokasi...',
                              border: InputBorder.none,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              suffixIcon: _isSearching
                                  ? const Padding(
                                      padding: EdgeInsets.all(12),
                                      child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)),
                                    )
                                  : (_searchController.text.isNotEmpty
                                      ? IconButton(
                                          icon: const Icon(Icons.clear, size: 20),
                                          onPressed: () {
                                            _searchController.clear();
                                            setState(() => _searchResults = []);
                                          },
                                        )
                                      : const Icon(Icons.search, color: AppColors.textMuted)),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  // Search Results List
                  if (_searchResults.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? AppColors.bgDark : Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        itemCount: _searchResults.length > 4 ? 4 : _searchResults.length,
                        separatorBuilder: (context, index) => const Divider(height: 1),
                        itemBuilder: (context, index) {
                          final item = _searchResults[index];
                          return ListTile(
                            leading: const Icon(Icons.place_outlined, color: AppColors.primary),
                            title: Text(item['name'] ?? 'Lokasi', maxLines: 1, overflow: TextOverflow.ellipsis),
                            subtitle: Text(item['display_name'] ?? '', maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.spaceGrotesk(fontSize: 12)),
                            onTap: () {
                              FocusScope.of(context).unfocus();
                              final String selectedName = item['name'] ?? item['display_name'] ?? 'Lokasi Terpilih';
                              
                              setState(() {
                                _searchResults = [];
                                _searchController.text = selectedName;
                                _currentAddress = selectedName;
                                _addressFromSearch = true; // Tandai: alamat dari search, jangan timpa
                              });
                              
                              final lat = double.parse(item['lat']);
                              final lon = double.parse(item['lon']);
                              final newCenter = LatLng(lat, lon);
                              _mapController.move(newCenter, 17.0);
                              _currentCenter = newCenter;
                              
                              final outOfBounds = !_isPointInPolygon(_currentCenter, _campusPolygon);
                              if (_isOutOfBounds != outOfBounds) {
                                setState(() => _isOutOfBounds = outOfBounds);
                              }
                              // Tidak memanggil _getAddressFromLatLng agar nama spesifik dari pencarian tidak tertimpa nama reverse geocoding yang lebih umum
                            },
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),

          // 4. Bottom Info Sheet & GPS Button
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // GPS Button
                Padding(
                  padding: const EdgeInsets.only(right: 16, bottom: 16),
                  child: FloatingActionButton(
                    onPressed: _getCurrentLocation,
                    backgroundColor: AppColors.primary,
                    child: const Icon(Icons.my_location_rounded, color: Colors.white),
                  ),
                ),
                
                // Bottom Sheet (Address & Confirm)
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.bgDark : Colors.white,
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, -5)),
                    ],
                  ),
                  child: SafeArea(
                    top: false,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Lokasi Terpilih',
                            style: GoogleFonts.spaceGrotesk(fontSize: 14, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.location_on, color: _isOutOfBounds ? AppColors.danger : AppColors.primary),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _isLoadingAddress
                                  ? const Text('Sedang memuat alamat...')
                                  : Text(_currentAddress,
                                      style: GoogleFonts.spaceGrotesk(
                                          fontSize: 16, 
                                          fontWeight: FontWeight.w700,
                                          color: _isOutOfBounds ? AppColors.danger : null,
                                      ),
                                      maxLines: 2, overflow: TextOverflow.ellipsis),
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: FilledButton(
                            onPressed: (_isLoadingAddress || _isOutOfBounds) ? null : () {
                              Navigator.pop(context, {
                                'latitude': _currentCenter.latitude,
                                'longitude': _currentCenter.longitude,
                                'address': _currentAddress,
                              });
                            },
                            style: FilledButton.styleFrom(
                              backgroundColor: _isOutOfBounds ? AppColors.danger.withValues(alpha: 0.5) : AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                            child: Text(
                                _isOutOfBounds ? 'Di Luar Area Kampus' : 'Gunakan Lokasi Ini', 
                                style: GoogleFonts.spaceGrotesk(fontSize: 16, fontWeight: FontWeight.w600)
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
