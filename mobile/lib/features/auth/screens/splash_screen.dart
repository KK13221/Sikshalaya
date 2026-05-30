import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../data/providers/mock_providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuthentication();
  }

  Future<void> _checkAuthentication() async {
    // Wait for splash logo display
    await Future.delayed(const Duration(milliseconds: 1500));
    if (!mounted) return;

    final apiService = ref.read(apiServiceProvider);
    final token = await apiService.getToken();

    if (token != null) {
      final user = await apiService.getCurrentUser();
      if (user != null) {
        // Set state and navigate to home
        ref.read(currentUserProvider.notifier).state = user.copyWith(name: 'Kamlesh Sharma');
        if (mounted) {
          context.go('/home');
        }
        return;
      } else {
        // Token is invalid/expired, clean it up
        await apiService.deleteToken();
      }
    }

    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.school, size: 72, color: AppColors.blue),
            SizedBox(height: 16),
            Text('StudentLens', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.ink)),
            SizedBox(height: 8),
            Text('Teacher mobile app', style: TextStyle(fontSize: 16, color: AppColors.muted)),
          ],
        ),
      ),
    );
  }
}
