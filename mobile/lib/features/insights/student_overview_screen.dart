import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../data/providers/mock_providers.dart';
import '../../models/app_models.dart';

class StudentOverviewScreen extends ConsumerWidget {
  const StudentOverviewScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overviewAsync = ref.watch(studentOverviewProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Student Overview'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(studentOverviewProvider),
          ),
        ],
      ),
      body: overviewAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Error loading overview: $e')),
        data: (overview) {
          final green  = overview['green']  ?? [];
          final yellow = overview['yellow'] ?? [];
          final red    = overview['red']    ?? [];

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Summary row
              Row(
                children: [
                  _SummaryTile(count: green.length,  color: const Color(0xFF22C55E), label: 'Good'),
                  const SizedBox(width: 8),
                  _SummaryTile(count: yellow.length, color: const Color(0xFFF59E0B), label: 'Average'),
                  const SizedBox(width: 8),
                  _SummaryTile(count: red.length,    color: const Color(0xFFEF4444), label: 'Urgent'),
                ],
              ),
              const SizedBox(height: 20),

              if (red.isNotEmpty) ...[
                _CategorySection(
                  title: 'Urgent Attention',
                  subtitle: 'These students need immediate support',
                  color: const Color(0xFFEF4444),
                  bgColor: const Color(0xFFFEF2F2),
                  icon: Icons.warning_rounded,
                  students: red,
                ),
                const SizedBox(height: 16),
              ],

              if (yellow.isNotEmpty) ...[
                _CategorySection(
                  title: 'Average',
                  subtitle: 'Performing adequately but can improve',
                  color: const Color(0xFFF59E0B),
                  bgColor: const Color(0xFFFFFBEB),
                  icon: Icons.trending_flat_rounded,
                  students: yellow,
                ),
                const SizedBox(height: 16),
              ],

              if (green.isNotEmpty) ...[
                _CategorySection(
                  title: 'Good',
                  subtitle: 'Performing well across all dimensions',
                  color: const Color(0xFF22C55E),
                  bgColor: const Color(0xFFF0FDF4),
                  icon: Icons.check_circle_rounded,
                  students: green,
                ),
              ],

              if (green.isEmpty && yellow.isEmpty && red.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32),
                    child: Text('No student data available yet.\nMetrics will appear once marks and attendance are recorded.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.grey)),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

// ── Summary tile at the top ────────────────────────────────────────────────
class _SummaryTile extends StatelessWidget {
  final int count;
  final Color color;
  final String label;
  const _SummaryTile({required this.count, required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Text('$count',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: color)),
            const SizedBox(height: 2),
            Text(label,
                style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

// ── Expandable category section ────────────────────────────────────────────
class _CategorySection extends StatefulWidget {
  final String title;
  final String subtitle;
  final Color color;
  final Color bgColor;
  final IconData icon;
  final List<StudentOverviewEntry> students;

  const _CategorySection({
    required this.title,
    required this.subtitle,
    required this.color,
    required this.bgColor,
    required this.icon,
    required this.students,
  });

  @override
  State<_CategorySection> createState() => _CategorySectionState();
}

class _CategorySectionState extends State<_CategorySection> {
  bool _expanded = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: widget.bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: widget.color.withOpacity(0.25)),
      ),
      child: Column(
        children: [
          // Header
          InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Icon(widget.icon, color: widget.color, size: 22),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.title,
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                                color: widget.color)),
                        Text(widget.subtitle,
                            style: const TextStyle(fontSize: 12, color: Colors.black54)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                    decoration: BoxDecoration(
                      color: widget.color.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text('${widget.students.length}',
                        style: TextStyle(
                            color: widget.color,
                            fontWeight: FontWeight.bold,
                            fontSize: 13)),
                  ),
                  const SizedBox(width: 6),
                  Icon(
                    _expanded ? Icons.expand_less : Icons.expand_more,
                    color: widget.color,
                  ),
                ],
              ),
            ),
          ),

          // Student cards
          if (_expanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
              child: Column(
                children: widget.students
                    .map((s) => _StudentCard(student: s, accentColor: widget.color))
                    .toList(),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Individual student card ────────────────────────────────────────────────
class _StudentCard extends StatelessWidget {
  final StudentOverviewEntry student;
  final Color accentColor;
  const _StudentCard({required this.student, required this.accentColor});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/students/${student.id}'),
      child: Container(
        margin: const EdgeInsets.only(top: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: accentColor.withOpacity(0.2)),
        ),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 20,
              backgroundColor: accentColor.withOpacity(0.15),
              child: Text(
                student.name.isNotEmpty ? student.name[0].toUpperCase() : '?',
                style: TextStyle(color: accentColor, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            // Name + class
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(student.name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  if (student.className != null)
                    Text(student.className!,
                        style: const TextStyle(fontSize: 12, color: Colors.black54)),
                ],
              ),
            ),
            // Score
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text('${student.combinedScore}%',
                    style: TextStyle(
                        color: accentColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 15)),
                Text('overall',
                    style: const TextStyle(fontSize: 10, color: Colors.black45)),
              ],
            ),
            const SizedBox(width: 4),
            Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }
}
