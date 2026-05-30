import 'package:flutter/material.dart';

class InsightsClassScreen extends StatelessWidget {
  const InsightsClassScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Insights')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Class overview', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          _InsightTile(title: 'Class average', value: '78%', subtitle: 'Trending up 4%'),
          _InsightTile(title: 'UT2 progress', value: '3 bars', subtitle: 'Above 80 / 60-80 / Below 60'),
          _InsightTile(title: 'Weak subjects', value: 'English, Science', subtitle: 'Focus areas for today'),
          _InsightTile(title: 'Strengths', value: 'Math, Social', subtitle: 'Consistent performance'),
        ],
      ),
    );
  }
}

class _InsightTile extends StatelessWidget {
  const _InsightTile({required this.title, required this.value, required this.subtitle});

  final String title;
  final String value;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text(subtitle),
        trailing: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ),
    );
  }
}
