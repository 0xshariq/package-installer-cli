import pygame
import sys

# Init
pygame.init()

WIDTH, HEIGHT = 800, 600
FPS = 60

screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Pygame Starter")

clock = pygame.time.Clock()

# Simple "player"
player_pos = pygame.Vector2(WIDTH // 2, HEIGHT // 2)
player_speed = 5
player_radius = 25

running = True
while running:
    dt = clock.tick(FPS) / 1000.0  # seconds/frame (if you want frame-independent movement)

    # Events
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    # Input
    keys = pygame.key.get_pressed()
    if keys[pygame.K_ESCAPE]:
        running = False

    if keys[pygame.K_LEFT] or keys[pygame.K_a]:
        player_pos.x -= player_speed
    if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
        player_pos.x += player_speed
    if keys[pygame.K_UP] or keys[pygame.K_w]:
        player_pos.y -= player_speed
    if keys[pygame.K_DOWN] or keys[pygame.K_s]:
        player_pos.y += player_speed

    # Clear
    screen.fill((20, 20, 30))

    # Draw player
    pygame.draw.circle(screen, (0, 200, 255), player_pos, player_radius)

    # Draw text
    font = pygame.font.SysFont(None, 24)
    text = font.render("Pygame Starter - Move with WASD/Arrow keys, ESC to quit", True, (255, 255, 255))
    screen.blit(text, (20, 20))

    # Flip
    pygame.display.flip()

pygame.quit()
sys.exit()
