import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'config/theme.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/auth/screens/splash_screen.dart';
import 'features/auth/screens/norms_screen.dart';
import 'features/attendance/attendance_screen.dart';
import 'features/classes/class_detail_screen.dart';
import 'features/classes/class_list_screen.dart';
import 'features/home/home_shell.dart';
import 'features/home/today_dashboard_screen.dart';
import 'features/marks/marks_entry_screen.dart';
import 'features/marks/marks_picker_screen.dart';
import 'features/notifications/notification_center_screen.dart';
import 'features/profile/profile_screen.dart';
import 'features/insights/insights_class_screen.dart';
import 'features/insights/student_overview_screen.dart';
import 'features/student/student_profile_screen.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'data/providers/mock_providers.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Sikshalaya Teacher',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      routerConfig: _router,
      builder: (context, child) {
        return Stack(
          children: [
            if (child != null) child,
            Consumer(
              builder: (context, ref, _) {
                final bannerText = ref.watch(demoBannerProvider);
                if (bannerText == null) return const SizedBox.shrink();
                return Positioned(
                  top: MediaQuery.of(context).padding.top + 10,
                  left: 16,
                  right: 16,
                  child: Material(
                    color: Colors.transparent,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withOpacity(0.95),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                        border: Border.all(color: const Color(0xFF38BDF8), width: 1.5),
                      ),
                      child: Row(
                        children: [
                          const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              color: Color(0xFF38BDF8),
                              strokeWidth: 2,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              bannerText,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
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
          ],
        );
      },
    );
  }
}

final GoRouter _router = GoRouter(
  initialLocation: '/splash',
  routes: [
    GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
    GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/norms', builder: (context, state) => const NormsScreen()),
    ShellRoute(
      builder: (context, state, child) => HomeShell(child: child),
      routes: [
        GoRoute(path: '/home', builder: (context, state) => const TodayDashboardScreen()),
        GoRoute(
          path: '/classes',
          builder: (context, state) => const ClassListScreen(),
          routes: [
            GoRoute(
              path: ':classId',
              builder: (context, state) {
                final classId = state.pathParameters['classId']!;
                return ClassDetailScreen(classId: classId);
              },
            ),
          ],
        ),
        GoRoute(path: '/notifications', builder: (context, state) => const NotificationCenterScreen()),
        GoRoute(path: '/profile', builder: (context, state) => const ProfileScreen()),
      ],
    ),

    // Accessed from Class Detail — not shell tabs
    GoRoute(
      path: '/attendance/:classId',
      builder: (context, state) {
        final classId = state.pathParameters['classId']!;
        return AttendanceScreen(classId: classId);
      },
    ),
    GoRoute(
      path: '/marks',
      builder: (context, state) => const MarksPickerScreen(),
      routes: [
        GoRoute(
          path: 'entry/:assessmentId',
          builder: (context, state) {
            final assessmentId = state.pathParameters['assessmentId']!;
            return MarksEntryScreen(assessmentId: assessmentId);
          },
        ),
      ],
    ),
    GoRoute(path: '/insights', builder: (context, state) => const InsightsClassScreen()),
    GoRoute(path: '/overview', builder: (context, state) => const StudentOverviewScreen()),
    GoRoute(
      path: '/student/:studentId',
      builder: (context, state) {
        final studentId = state.pathParameters['studentId']!;
        return StudentProfileScreen(studentId: studentId);
      },
    ),
    GoRoute(
      path: '/students/:studentId',
      builder: (context, state) {
        final studentId = state.pathParameters['studentId']!;
        return StudentProfileScreen(studentId: studentId);
      },
    ),
  ],
);
