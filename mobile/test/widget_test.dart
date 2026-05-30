// This is a basic Flutter widget test for StudentLens.

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:studentlens_teacher_app/main.dart';

void main() {
  testWidgets('Splash screen smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ProviderScope(child: StudentLensApp()));

    // Verify that our splash screen text is shown.
    expect(find.text('StudentLens'), findsOneWidget);
    expect(find.text('Teacher mobile app'), findsOneWidget);

    // Advance the virtual clock by 2 seconds to let the splash timer fire and finish
    await tester.pump(const Duration(seconds: 2));
  });
}

