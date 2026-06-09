import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../config/theme.dart';
import '../../../data/providers/mock_providers.dart';

class NormsScreen extends ConsumerStatefulWidget {
  const NormsScreen({super.key});

  @override
  ConsumerState<NormsScreen> createState() => _NormsScreenState();
}

class _NormsScreenState extends ConsumerState<NormsScreen> {
  bool _agreed = false;
  bool _submitting = false;

  Future<void> _handleAccept() async {
    if (!_agreed || _submitting) return;

    setState(() => _submitting = true);
    final apiService = ref.read(apiServiceProvider);

    final success = await apiService.acceptNorms();
    if (!success) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to accept norms. Please check your connection and try again.'),
            backgroundColor: AppColors.red,
          ),
        );
      }
      return;
    }

    // Refresh current user state from backend to update requiresNormsAcceptance to false
    final user = await apiService.getCurrentUser();
    if (user != null) {
      ref.read(currentUserProvider.notifier).state = user;
    }

    setState(() => _submitting = false);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Teacher Norms and Declaration accepted successfully.'),
          backgroundColor: AppColors.green,
        ),
      );
      ref.read(classListProvider.notifier).loadClasses();
      ref.read(notificationsProvider.notifier).loadNotifications();
      context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final normsText = user.teacherNorms ?? 'No norms configured. Please contact the administrator.';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Teacher Norms & Declaration'),
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.ink,
        elevation: 0.5,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Icon(
                      Icons.gavel_rounded,
                      size: 64,
                      color: AppColors.blue,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Important Policy Update',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Please read and accept the updated Teacher Norms (Version ${user.teacherNormsVersion}) to continue using Sikshalaya.',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppColors.muted,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Text(
                        normsText,
                        style: const TextStyle(
                          fontSize: 14,
                          height: 1.5,
                          color: AppColors.ink,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        height: 24,
                        width: 24,
                        child: Checkbox(
                          value: _agreed,
                          onChanged: _submitting
                              ? null
                              : (val) => setState(() => _agreed = val ?? false),
                          activeColor: AppColors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'I have read and agree to the Teacher Norms and Declaration.',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: AppColors.ink,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: (_agreed && !_submitting) ? _handleAccept : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.blue,
                      disabledBackgroundColor: Colors.grey[300],
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      elevation: 0,
                    ),
                    child: _submitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            'Accept & Continue',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: _agreed ? Colors.white : Colors.grey[600],
                            ),
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
