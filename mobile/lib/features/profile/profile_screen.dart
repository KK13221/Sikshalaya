import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../data/providers/mock_providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final settings = ref.watch(settingsProvider);
    final settingsNotifier = ref.read(settingsProvider.notifier);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.w700))),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(radius: 30, child: Text(user.name.isNotEmpty ? user.name[0] : 'T')),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Text(user.email),
                        const SizedBox(height: 6),
                        Text(user.branch, style: const TextStyle(color: Colors.black54)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('School Administration', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.ink)),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Column(
                children: [
                  ListTile(
                    dense: true,
                    leading: CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.blue.withOpacity(0.12),
                      child: const Icon(Icons.person, color: AppColors.blue, size: 16),
                    ),
                    title: Text('Branch Principal (${user.branch})', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.ink)),
                    subtitle: Text('${user.principalName ?? 'Not Assigned'}\n${user.principalEmail ?? 'N/A'}', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    isThreeLine: true,
                  ),
                  const Divider(height: 1, color: AppColors.lineFaint),
                  ListTile(
                    dense: true,
                    leading: CircleAvatar(
                      radius: 16,
                      backgroundColor: AppColors.green.withOpacity(0.12),
                      child: const Icon(Icons.admin_panel_settings, color: AppColors.green, size: 16),
                    ),
                    title: const Text('Super Administrator (All Branches)', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.ink)),
                    subtitle: Text('${user.superAdminName ?? 'System Admin'}\n${user.superAdminEmail ?? 'admin@shikshalaya.in'}', style: const TextStyle(fontSize: 10, color: AppColors.muted)),
                    isThreeLine: true,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text('Performance Report', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.ink)),
          const SizedBox(height: 12),
          ref.watch(teacherPerformanceSummaryProvider).when(
            loading: () => const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator())),
            error: (err, stack) => const Card(child: Padding(padding: EdgeInsets.all(16), child: Text('Failed to load performance report.'))),
            data: (data) {
              if (data == null || data['logs'] == null || (data['logs'] as List).isEmpty) {
                return const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('No performance ratings logged yet by the administration.', style: TextStyle(color: AppColors.muted, fontSize: 13)),
                  ),
                );
              }

              final avg = (data['averageScore'] as num?)?.toDouble() ?? 0.0;
              final logs = data['logs'] as List;

              Color badgeColor = AppColors.red;
              if (avg >= 8.0) {
                badgeColor = AppColors.green;
              } else if (avg >= 6.0) {
                badgeColor = AppColors.yellow;
              }

              return Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Average Performance Score',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: badgeColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: badgeColor, width: 1.5),
                            ),
                            child: Text(
                              '$avg / 10.0',
                              style: TextStyle(
                                color: badgeColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      const Divider(height: 1, color: AppColors.lineFaint),
                      const SizedBox(height: 12),
                      const Text(
                        'Recent Performance Logs',
                        style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.ink),
                      ),
                      const SizedBox(height: 8),
                      ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: logs.length > 5 ? 5 : logs.length,
                        separatorBuilder: (context, index) => const Divider(height: 16, color: AppColors.lineFaint),
                        itemBuilder: (context, index) {
                          final log = logs[index] as Map<String, dynamic>;
                          final dateStr = log['date']?.toString() ?? '';
                          final category = log['category']?.toString() ?? 'General';
                          final remark = log['remark']?.toString() ?? '';
                          final score = log['score']?.toString() ?? '0';

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    category,
                                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.ink),
                                  ),
                                  Text(
                                    '$score/10',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppColors.blue),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    dateStr,
                                    style: const TextStyle(fontSize: 10, color: AppColors.muted),
                                  ),
                                  Text(
                                    'Logged by: ${log['logger']?['name'] ?? 'Principal'}',
                                    style: const TextStyle(fontSize: 10, color: AppColors.muted),
                                  ),
                                ],
                              ),
                              if (remark.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  width: double.infinity,
                                  decoration: BoxDecoration(
                                    color: Colors.grey[50],
                                    borderRadius: BorderRadius.circular(6),
                                    border: Border.all(color: Colors.grey[200]!),
                                  ),
                                  child: Text(
                                    remark,
                                    style: TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: Colors.grey[800]),
                                  ),
                                ),
                              ],
                            ],
                          );
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          const Text('Account settings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.ink)),
          const SizedBox(height: 12),
          _SettingsSwitchTile(
            title: 'Notifications',
            subtitle: 'Manage alerts and push preferences',
            value: settings.notificationsEnabled,
            onChanged: (val) => settingsNotifier.setNotificationsEnabled(val),
          ),
          _SettingsTile(
            title: 'Language',
            subtitle: 'Selected: ${settings.language}',
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Select Language', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        title: const Text('English'),
                        trailing: settings.language == 'English' ? const Icon(Icons.check, color: Colors.blue) : null,
                        onTap: () {
                          settingsNotifier.setLanguage('English');
                          Navigator.pop(context);
                        },
                      ),
                      ListTile(
                        title: const Text('हिंदी (Hindi)'),
                        trailing: settings.language == 'Hindi' ? const Icon(Icons.check, color: Colors.blue) : null,
                        onTap: () {
                          settingsNotifier.setLanguage('Hindi');
                          Navigator.pop(context);
                        },
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          _SettingsTile(title: 'Help & Support', subtitle: 'Read FAQ or contact support', onTap: () {}),
          _SettingsTile(
            title: 'Sign out',
            subtitle: 'Logout from this device',
            onTap: () async {
              final api = ref.read(apiServiceProvider);
              await api.logout();
              if (context.mounted) {
                context.go('/login');
              }
            },
          ),
        ],
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  const _SettingsTile({required this.title, required this.subtitle, required this.onTap});
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.black54)),
        trailing: const Icon(Icons.chevron_right, size: 16),
        onTap: onTap,
      ),
    );
  }
}

class _SettingsSwitchTile extends StatelessWidget {
  const _SettingsSwitchTile({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: SwitchListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        subtitle: Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.black54)),
        value: value,
        onChanged: onChanged,
        activeColor: Colors.blue,
      ),
    );
  }
}
