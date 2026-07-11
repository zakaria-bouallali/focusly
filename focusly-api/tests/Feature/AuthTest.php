<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Alice Test',
            'email' => 'alice@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'alice@example.com']);
    }

    public function test_user_can_login(): void
    {
        $user = User::create([
            'name' => 'Bob Test',
            'email' => 'bob@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bob@example.com',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);
    }

    public function test_authenticated_user_can_fetch_me(): void
    {
        $user = User::create([
            'name' => 'Charlie Test',
            'email' => 'charlie@example.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200)
                 ->assertJson(['email' => 'charlie@example.com']);
    }
}
