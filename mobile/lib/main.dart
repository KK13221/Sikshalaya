import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';

void main() {
  runApp(const ProviderScope(child: StudentLensApp()));
}

class StudentLensApp extends StatelessWidget {
  const StudentLensApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const App();
  }
}
