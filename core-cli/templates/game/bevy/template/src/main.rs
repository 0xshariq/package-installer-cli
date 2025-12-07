use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "Bevy Starter".to_string(),
                resolution: (900., 600.).into(),
                resizable: true,
                ..Default::default()
            }),
            ..Default::default()
        }))
        .add_systems(Startup, setup)
        .add_systems(Update, rotate_cube)
        .run();
}

#[derive(Component)]
struct Rotates;

fn setup(
    mut commands: Commands,
    mut meshes: ResMut<Assets<Mesh>>,
    mut materials: ResMut<Assets<StandardMaterial>>,
) {
    // Camera
    commands.spawn(Camera3dBundle {
        transform: Transform::from_xyz(0.0, 1.5, 5.0).looking_at(Vec3::ZERO, Vec3::Y),
        ..Default::default()
    });

    // Light
    commands.spawn(PointLightBundle {
        point_light: PointLight {
            intensity: 2000.0,
            shadows_enabled: true,
            ..Default::default()
        },
        transform: Transform::from_xyz(3.0, 5.0, 3.0),
        ..Default::default()
    });

    // Cube
    let cube_mesh = meshes.add(Cuboid::new(1.0, 1.0, 1.0));
    let cube_material = materials.add(StandardMaterial {
        base_color: Color::srgb(0.0, 0.8, 0.5),
        ..Default::default()
    });

    commands.spawn((
        PbrBundle {
            mesh: cube_mesh,
            material: cube_material,
            transform: Transform::from_xyz(0.0, 0.5, 0.0),
            ..Default::default()
        },
        Rotates,
    ));

    // Ground plane
    let plane_mesh = meshes.add(Plane3d::default().mesh().size(10.0, 10.0));
    let plane_mat = materials.add(Color::srgb(0.1, 0.1, 0.15));

    commands.spawn(PbrBundle {
        mesh: plane_mesh,
        material: plane_mat,
        transform: Transform::from_xyz(0.0, 0.0, 0.0),
        ..Default::default()
    });
}

fn rotate_cube(time: Res<Time>, mut query: Query<&mut Transform, With<Rotates>>) {
    for mut transform in &mut query {
        transform.rotate_y(1.0 * time.delta_seconds());
        transform.rotate_x(0.5 * time.delta_seconds());
    }
}
