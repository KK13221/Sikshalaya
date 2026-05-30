import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class NotificationCenterScreen extends ConsumerStatefulWidget {
  const NotificationCenterScreen({super.key});

  @override
  ConsumerState<NotificationCenterScreen> createState() => _NotificationCenterScreenState();
}

class _NotificationCenterScreenState extends ConsumerState<NotificationCenterScreen> {
  NotificationPriority? _filter;

  static Color _priorityColor(NotificationPriority p) => switch (p) {
    NotificationPriority.urgent => AppColors.red,
    NotificationPriority.reminder => AppColors.yellow,
    NotificationPriority.parent => AppColors.blue,
    NotificationPriority.info => AppColors.muted,
  };

  static String _priorityLabel(NotificationPriority p) => switch (p) {
    NotificationPriority.urgent => 'URGENT',
    NotificationPriority.reminder => 'REMINDER',
    NotificationPriority.parent => 'PARENT',
    NotificationPriority.info => 'INFO',
  };

  static String _priorityIcon(NotificationPriority p) => switch (p) {
    NotificationPriority.urgent => '!',
    NotificationPriority.reminder => '✎',
    NotificationPriority.parent => '✉',
    NotificationPriority.info => 'i',
  };

  void _handleTap(BuildContext context, AppNotification n) {
    switch (n.category) {
      case 'underperformer':
        context.push('/student/s3');
      case 'attendance_overdue':
        context.push('/attendance/c3');
      case 'marks_due':
        context.push('/marks');
      default:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    final all = ref.watch(notificationsProvider);
    final items = _filter == null ? all : all.where((n) => n.priority == _filter).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Notifications', style: TextStyle(fontWeight: FontWeight.w700))),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 4),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(label: 'All', active: _filter == null, color: AppColors.blue, onTap: () => setState(() => _filter = null)),
                  const SizedBox(width: 6),
                  ...NotificationPriority.values.map((p) => Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: _FilterChip(label: _priorityLabel(p), active: _filter == p, color: _priorityColor(p), onTap: () => setState(() => _filter = _filter == p ? null : p)),
                  )),
                ],
              ),
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(14),
              itemCount: items.length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final n = items[i];
                final col = _priorityColor(n.priority);
                return GestureDetector(
                  onTap: () => _handleTap(context, n),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      border: Border.all(color: AppColors.lineFaint),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [BoxShadow(color: col.withOpacity(0.0), blurRadius: 0)],
                    ),
                    child: IntrinsicHeight(
                      child: Row(
                        children: [
                          Container(width: 4, decoration: BoxDecoration(color: col, borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)))),
                          Expanded(
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    width: 28, height: 28,
                                    decoration: BoxDecoration(color: col.withOpacity(0.12), shape: BoxShape.circle),
                                    alignment: Alignment.center,
                                    child: Text(_priorityIcon(n.priority), style: TextStyle(color: col, fontWeight: FontWeight.w800, fontSize: 12)),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Text(_priorityLabel(n.priority), style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: col, letterSpacing: 0.5)),
                                            const SizedBox(width: 4),
                                            Text('· ${n.timeAgo}', style: const TextStyle(fontSize: 9, color: AppColors.muted)),
                                          ],
                                        ),
                                        const SizedBox(height: 2),
                                        Text(n.title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                        const SizedBox(height: 2),
                                        Text(n.subtitle, style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                                      ],
                                    ),
                                  ),
                                  if (n.unread)
                                    Container(width: 7, height: 7, margin: const EdgeInsets.only(top: 4), decoration: BoxDecoration(color: col, shape: BoxShape.circle)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({required this.label, required this.active, required this.color, required this.onTap});
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? color : Colors.white,
          border: Border.all(color: active ? color : AppColors.lineSoft),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: active ? Colors.white : AppColors.muted)),
      ),
    );
  }
}
