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
                    subtitle: const Text('Dr. Karthik Srivastava\nprincipal.gurugram@shikshalaya.in', style: TextStyle(fontSize: 10, color: AppColors.muted)),
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
                    subtitle: const Text('Sikshalaya SuperAdmin\nsuperadmin@sikshalaya.in', style: TextStyle(fontSize: 10, color: AppColors.muted)),
                    isThreeLine: true,
                  ),
                ],
              ),
            ),
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
          _SettingsSwitchTile(
            title: 'Sync over Wi-Fi only',
            subtitle: 'Pause uploads when on mobile data',
            value: settings.syncWifiOnly,
            onChanged: (val) => settingsNotifier.setSyncWifiOnly(val),
          ),
          _SettingsSwitchTile(
            title: 'Offline mode',
            subtitle: 'Force local-only operation',
            value: settings.offlineMode,
            onChanged: (val) => settingsNotifier.setOfflineMode(val),
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
