#include "MainWindow.h"
#include <QLabel>
#include <QVBoxLayout>
#include <QWidget>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    auto *central = new QWidget(this);
    auto *layout = new QVBoxLayout();

    auto *label = new QLabel("Hello from Qt Starter Template");
    label->setAlignment(Qt::AlignCenter);

    layout->addWidget(label);
    central->setLayout(layout);

    setCentralWidget(central);
    setWindowTitle("My Qt App");
}

MainWindow::~MainWindow() {}
