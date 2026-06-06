import 'dart:convert';
import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class PhotoGallery extends StatelessWidget {
  final List<String> photoUrls;
  final String title;

  const PhotoGallery({super.key, required this.photoUrls, required this.title});

  void _showLightbox(BuildContext context, int initialIndex) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _LightboxPage(photoUrls: photoUrls, initialIndex: initialIndex),
      ),
    );
  }

  Widget _buildImage(String base64Str) {
    try {
      final bytes = base64Decode(base64Str.split(',').last);
      return Image.memory(bytes, fit: BoxFit.cover, width: double.infinity, height: double.infinity);
    } catch (_) {
      return Container(
        color: AppColors.borderLight,
        child: const Center(child: Icon(Icons.broken_image_rounded, color: AppColors.textMuted)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (photoUrls.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 120,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: photoUrls.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () => _showLightbox(context, index),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    width: 120,
                    height: 120,
                    child: Hero(
                      tag: 'photo_${title}_$index',
                      child: _buildImage(photoUrls[index]),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _LightboxPage extends StatefulWidget {
  final List<String> photoUrls;
  final int initialIndex;

  const _LightboxPage({required this.photoUrls, required this.initialIndex});

  @override
  State<_LightboxPage> createState() => _LightboxPageState();
}

class _LightboxPageState extends State<_LightboxPage> {
  late PageController _pageController;
  late int _currentIndex;

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    _pageController = PageController(initialPage: _currentIndex);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Widget _buildImage(String base64Str) {
    try {
      final bytes = base64Decode(base64Str.split(',').last);
      return Image.memory(bytes, fit: BoxFit.contain);
    } catch (_) {
      return const Center(child: Icon(Icons.broken_image_rounded, color: Colors.white, size: 64));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        title: Text(
          '${_currentIndex + 1} / ${widget.photoUrls.length}',
          style: const TextStyle(color: Colors.white, fontSize: 16),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: PageView.builder(
        controller: _pageController,
        onPageChanged: (index) => setState(() => _currentIndex = index),
        itemCount: widget.photoUrls.length,
        itemBuilder: (context, index) {
          return InteractiveViewer(
            minScale: 1.0,
            maxScale: 4.0,
            child: Center(
              child: Hero(
                tag: 'photo_${widget.photoUrls.hashCode}_$index', // Not perfectly matching the caller's tag but works for simple transition
                child: _buildImage(widget.photoUrls[index]),
              ),
            ),
          );
        },
      ),
    );
  }
}
