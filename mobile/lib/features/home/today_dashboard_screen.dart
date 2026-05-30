import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class TodayDashboardScreen extends ConsumerWidget {
  const TodayDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final classes = ref.watch(classListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Good morning, ${user.name}',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Here are today\'s highlights and pending actions.'),
          const SizedBox(height: 16),
          // Behavior summary bar — Issue #8
          const _BehaviorSummaryBanner(),
          const SizedBox(height: 16),
          const _TodayCard(),
          const SizedBox(height: 20),
          const Text('Your classes',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 12),
          ...classes.map((info) => _ClassSummaryCard(info: info)),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showQuickActions(context),
        label: const Text('Quick Actions'),
        icon: const Icon(Icons.flash_on),
      ),
    );
  }

  void _showQuickActions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ListTile(
            leading: const Icon(Icons.event_available),
            title: const Text('Attendance'),
            onTap: () {
              Navigator.pop(ctx);
              context.go('/classes');
            },
          ),
          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('Marks'),
            onTap: () {
              Navigator.pop(ctx);
              context.push('/marks');
            },
          ),
          ListTile(
            leading: const Icon(Icons.mood),
            title: const Text('Behaviour'),
            onTap: () {
              Navigator.pop(ctx);
              context.push('/overview');
            },
          ),
        ],
      ),
    );
  }
}

// ── Behavior Summary Banner ────────────────────────────────────────────────
class _BehaviorSummaryBanner extends ConsumerWidget {
  const _BehaviorSummaryBanner();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overviewAsync = ref.watch(studentOverviewProvider);

    return overviewAsync.when(
      loading: () => const _BannerShimmer(),
      error: (_, __) => const SizedBox.shrink(),
      data: (overview) {
        final green  = overview['green']?.length  ?? 0;
        final yellow = overview['yellow']?.length ?? 0;
        final red    = overview['red']?.length    ?? 0;

        return GestureDetector(
          onTap: () => context.push('/overview'),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 8, offset: const Offset(0, 2))],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                const Icon(Icons.bar_chart_rounded, size: 22, color: Colors.indigo),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text('Student Performance',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                ),
                _CategoryChip(count: green,  color: const Color(0xFF22C55E), label: 'Good'),
                const SizedBox(width: 6),
                _CategoryChip(count: yellow, color: const Color(0xFFF59E0B), label: 'Avg'),
                const SizedBox(width: 6),
                _CategoryChip(count: red,    color: const Color(0xFFEF4444), label: 'Urgent'),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _CategoryChip extends StatelessWidget {
  final int count;
  final Color color;
  final String label;
  const _CategoryChip({required this.count, required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 8, height: 8,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 4),
          Text('$count', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
        ],
      ),
    );
  }
}

class _BannerShimmer extends StatelessWidget {
  const _BannerShimmer();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }
}

// ── Today Card ─────────────────────────────────────────────────────────────
class _TodayCard extends ConsumerWidget {
  const _TodayCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasks = ref.watch(pendingTasksProvider);

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('Pending tasks',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                const Spacer(),
                if (tasks.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${tasks.length}',
                      style: const TextStyle(
                          color: Color(0xFFEF4444),
                          fontWeight: FontWeight.bold,
                          fontSize: 13),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            if (tasks.isEmpty)
              const Text('All caught up! No pending tasks.',
                  style: TextStyle(color: Color(0xFF10B981), fontSize: 13))
            else
              ...tasks.map((task) => _PendingTaskRow(task: task)),
          ],
        ),
      ),
    );
  }
}

class _PendingTaskRow extends StatelessWidget {
  final PendingTask task;
  const _PendingTaskRow({required this.task});

  @override
  Widget build(BuildContext context) {
    final isUrgent = task.priority == 'urgent';
    final color = isUrgent ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);
    final icon = task.type == 'attendance'
        ? Icons.event_available_outlined
        : task.type == 'marks'
            ? Icons.edit_outlined
            : Icons.warning_amber_outlined;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () => context.push(task.actionRoute),
        child: Row(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(width: 8),
            Expanded(
              child: Text(task.title,
                  style: TextStyle(fontSize: 13, color: color, fontWeight: FontWeight.w500)),
            ),
            Icon(Icons.arrow_forward_ios, size: 12, color: color.withOpacity(0.6)),
          ],
        ),
      ),
    );
  }
}

// ── Class Summary Card ─────────────────────────────────────────────────────
class _ClassSummaryCard extends StatelessWidget {
  const _ClassSummaryCard({required this.info});
  final ClassInfo info;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text('${info.name} • ${info.subject}'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${info.students} students · ${info.attendancePercent}% attendance today'),
            if (info.classTeacherName != null)
              Text('Class Teacher: ${info.classTeacherName}',
                  style: const TextStyle(fontSize: 12, color: Colors.indigo)),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () => context.push('/classes/${info.id}'),
      ),
    );
  }
}
