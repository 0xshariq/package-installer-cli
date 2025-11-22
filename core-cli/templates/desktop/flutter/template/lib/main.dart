import 'package:flutter/material.dart';
import 'dart:io' show Platform;

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    final title = 'Flutter Desktop Starter';
    return MaterialApp(
      title: title,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: Colors.indigo,
      ),
      home: HomePage(title: title),
      debugShowCheckedModeBanner: false,
    );
  }
}

class HomePage extends StatefulWidget {
  final String title;
  const HomePage({required this.title, super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  String _platform = '';

  @override
  void initState() {
    super.initState();
    try {
      _platform = Platform.operatingSystem; // 'windows', 'macos', 'linux'
    } catch (_) {
      _platform = 'unknown';
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now().toLocal();
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: Center(
        child: Card(
          elevation: 6,
          margin: const EdgeInsets.all(24),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Text('Hello from Flutter Desktop!', style: TextStyle(fontSize: 20)),
              const SizedBox(height: 12),
              Text('Platform: $_platform'),
              const SizedBox(height: 12),
              Text('Local time: $now'),
              const SizedBox(height: 16),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton.icon(
                    icon: const Icon(Icons.refresh),
                    label: const Text('Refresh time'),
                    onPressed: () => setState(() {}),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.info_outline),
                    label: const Text('About'),
                    onPressed: () => showAboutDialog(
                      context: context,
                      applicationName: widget.title,
                      applicationVersion: '0.1.0',
                      children: [
                        const Text('A minimal Flutter desktop starter.\nNo Flutter commands were run to create these files.')
                      ],
                    ),
                  )
                ],
              )
            ]),
          ),
        ),
      ),
    );
  }
}
