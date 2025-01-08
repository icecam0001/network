# Network

A Twitter-like social network website for making posts and following users. Built as part of CS50's Web Programming with Python and JavaScript course.

## Features

### New Post
- Users can create new text-based posts
- Character limit of 280 characters per post
- Posts appear in reverse chronological order
- Each post displays timestamp and author

### All Posts
- View all posts from all users
- Pagination showing 10 posts per page
- Like/unlike posts functionality
- Edit your own posts
- Dynamic updates without page reload

### Profile Pages
- Click on usernames to visit profile pages
- Display number of followers and users being followed
- Follow/unfollow other users
- View all posts by specific users

### Following
- Dedicated page showing posts from followed users
- Same functionality as All Posts page but filtered

## Technologies Used

- **Frontend**: JavaScript, HTML, CSS
- **Backend**: Python/Django
- **Database**: SQLite
- **Additional Libraries**: 
  - Bootstrap for styling
  - Django REST framework for API endpoints

## Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/network.git
```

2. Navigate to the project directory:
```bash
cd network
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Make migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Run the development server:
```bash
python manage.py runserver
```

## File Structure

```
network/
├── manage.py
├── network/
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── project4/
    ├── admin.py
    ├── apps.py
    ├── models.py
    ├── static/
    │   └── project4/
    │       ├── styles.css
    │       └── network.js
    ├── templates/
    │   └── project4/
    │       ├── index.html
    │       ├── layout.html
    │       ├── login.html
    │       └── register.html
    ├── tests.py
    ├── urls.py
    └── views.py
```

## API Routes

- `GET /posts` - Get all posts
- `POST /posts` - Create a new post
- `PUT /posts/<int:post_id>` - Edit a post
- `GET /posts/<str:username>` - Get posts by username
- `GET /following` - Get posts from followed users
- `PUT /like/<int:post_id>` - Like/unlike a post
- `PUT /follow/<str:username>` - Follow/unfollow a user

## Models

### User
- Extends Django's AbstractUser
- Additional fields for following relationships

### Post
- id
- user (ForeignKey to User)
- content
- timestamp
- likes (ManyToManyField with User)

## Specification Requirements

- [x] New Post
- [x] All Posts
- [x] Profile Page
- [x] Following
- [x] Pagination
- [x] Edit Post
- [x] Like and Unlike
- [x] Asynchronous Updates

## Contributing

This is a learning project, but suggestions and improvements are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- CS50's Web Programming with Python and JavaScript course
- Harvard University
- edX
