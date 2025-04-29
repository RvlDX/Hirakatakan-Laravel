# Hirakatakan-Laravel
## Overview
This is a Laravel 12 application for learning and practicing Japanese characters (Hiragana, Katakana, and Kanji). The application allows users to:

- Select different Japanese scripts (Hiragana, Katakana, Kanji)
- Choose specific categories and subcategories to practice
- Take quizzes with randomly selected characters
- View quiz results and track progress
- Access learning resources for each script

## Requirements
- Laravel 12
- PHP >= 8.1
- Composer
- MySQL or any supported database

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/RvlDX/hirakatakan-laravel.git
    cd hirakatakan-laravel
    ```

2. Install dependencies:
    ```bash
    composer install
    ```

3. Copy `.env.example` to `.env` and configure your environment variables:
    ```bash
    cp .env.example .env
    ```

4. Generate the application key:
    ```bash
    php artisan key:generate
    ```

5. Configure your database in the .env file:
    ```
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=quiz_hirakatakan
    DB_USERNAME=your_username
    DB_PASSWORD=your_password
    ``` 

6. Run migrations and seed the database:
    ```bash
    php artisan migrate --seed
    ```

7. Start the development server:
    ```bash
    php artisan serve
    ```

9. Open in your browser
    ```bash
    http://localhost:8000
    ```

## Features
### Quiz System
- Multiple choice quizzes for Japanese characters
- Customizable quiz content based on selected categories
- Real-time feedback on answers
- Score tracking and results summary

### Learning Resources
- Comprehensive character listings organized by category
- Visual display of characters with readings and meanings
- Easy navigation between different scripts

### User Interface
- Responsive design for desktop and mobile devices
- Light/dark theme toggle
- Intuitive navigation

## Database Structure
The application uses the following database tables:

- `scripts` - Stores the three main Japanese scripts (Hiragana, Katakana, Kanji)
- `categories` - Groups of characters within each script
- `subcategories` - Specific sets of characters within categories
- `questions` - Individual Japanese characters with readings and meanings
- `session` - Save user agent to access the website

## Customization
You can customize the application by:

1. Adding more characters to the database seeder
2. Modifying the CSS in public/css/app.css
3. Extending the controller functionality in app/Http/Controllers/QuizController.php

## Contributing
We welcome contributions! Here's how you can help:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Submit a pull request with a detailed description of your changes.

## License
This project is open-source and available under the [MIT License](LICENSE).

## Support
If you encounter any issues or have questions, feel free to open an issue or contact us via email. Contributions, suggestions, and feedback are always appreciated!
