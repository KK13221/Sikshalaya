import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeShell extends StatelessWidget {
  const HomeShell({required this.child, super.key});

  final Widget child;

  static const tabs = [
    _ShellTab(label: 'Dashboard', icon: Icons.home_outlined, route: '/home'),
    _ShellTab(label: 'Classes', icon: Icons.book_outlined, route: '/classes'),
    _ShellTab(label: 'Notifications', icon: Icons.notifications_outlined, route: '/notifications'),
    _ShellTab(label: 'Profile', icon: Icons.person_outline, route: '/profile'),
  ];

  int _currentIndex(String location) {
    final index = tabs.indexWhere((tab) => location.startsWith(tab.route));
    return index < 0 ? 0 : index;
  }

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).location;
    final currentIndex = _currentIndex(location);

    return PopScope(
      canPop: currentIndex == 0,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        if (currentIndex > 0) {
          context.go('/home');
        }
      },
      child: Scaffold(
        body: child,
        bottomNavigationBar: NavigationBar(
          selectedIndex: currentIndex,
          onDestinationSelected: (index) {
            context.go(tabs[index].route);
          },
          destinations: tabs
              .map((tab) => NavigationDestination(icon: Icon(tab.icon), label: tab.label))
              .toList(),
        ),
      ),
    );
  }
}

class _ShellTab {
  const _ShellTab({required this.label, required this.icon, required this.route});
  final String label;
  final IconData icon;
  final String route;
}
