# Social Network

A Django-based social networking platform implementing asynchronous JavaScript for dynamic content loading and real-time updates.

## Technical Architecture

### Backend Implementation

#### Models
```python
class User(AbstractUser):
    following = models.ManyToManyField("self", symmetrical=False, related_name="followers")

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, blank=True, related_name="liked_posts")
```

#### API Endpoints & View Logic

1. **Post Management**
```python
# Create Post
POST /make
Request: {'content': 'string'}
Response: {'message': 'Post created successfully'}

# Edit Post
PUT /posts/{post_id}/edit
Request: {'content': 'string'}
Response: {'message': 'Post updated successfully'}

# Like Post
PUT /posts/{post_id}/like
Response: {'likes': ['username1', 'username2']}
```

2. **Post Retrieval**
```python
GET /posts/{field}?page={page_number}
Parameters:
- field: 'all'|'user'|'following'
- page: int
Response: {
    'posts': [Post],
    'page': int,
    'has_next': boolean,
    'has_previous': boolean,
    'total_pages': int
}
```

3. **User Management**
```python
GET /profile/{username}
Response: {
    'username': string,
    'followers': [string],
    'following': [string],
    'is_following': boolean,
    'same_user': boolean
}

PUT /follow/{username}
Response: {
    'message': string,
    'is_following': boolean
}
```

### Frontend Implementation

#### JavaScript Module Structure

1. **Post Loading System**
```javascript
let currentPage = 1;
let currentView = 'all';

function load_posts(type, page = 1) {
    // Manages pagination state
    // Handles fetch requests
    // Updates DOM with new posts
}

function add_post(post) {
    // Creates post DOM elements
    // Attaches event listeners
    // Handles user permissions
}
```

2. **Post Creation System**
```javascript
function make_post(event) {
    // Prevents form default
    // Handles CSRF
    // Manages fetch requests
    // Updates view after success
}
```

3. **User Profile System**
```javascript
function load_user(username) {
    // Loads user profile data
    // Creates profile view
    // Handles follow/unfollow
    // Loads user's posts
}
```

4. **Post Update System**
```javascript
function render_updateform(post) {
    // Creates edit form
    // Handles form submission
    // Manages CSRF
    // Updates post content
}
```

#### Event Handling
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize post form listener
    // Set up pagination controls
    // Load initial posts
});
```

### Security Implementation

#### CSRF Protection
- CSRF tokens required for all POST/PUT requests
- Token extraction from Django template
- Token inclusion in fetch headers

```javascript
const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
headers: {
    'X-CSRFToken': csrftoken,
    'Content-Type': 'application/json'
}
```

#### Authentication Checks
- Server-side validation of user permissions
- Client-side display logic based on user status
- Protected routes requiring authentication

### Database Schema

```sql
User:
- id (Primary Key)
- username (Unique)
- password (Hashed)
- following (ManyToMany -> User)
- followers (ManyToMany -> User through following)

Post:
- id (Primary Key)
- user (Foreign Key -> User)
- content (Text)
- timestamp (DateTime)
- likes (ManyToMany -> User)
```

### Pagination Implementation

Server-side pagination using Django's Paginator:
```python
paginator = Paginator(posts, 10)
current_page = paginator.page(page_number)
```

Client-side pagination management:
```javascript
document.querySelector('#page-info').textContent = `Page ${data.page} of ${data.total_pages}`;
document.querySelector('#prev-page').disabled = !data.has_previous;
document.querySelector('#next-page').disabled = !data.has_next;
```

### Development Environment

#### Required Dependencies
- Python 3.x
- Django 3.x
- Bootstrap 4.4.1
- Modern web browser with JavaScript enabled

#### Development Setup
```bash
# Database setup
python manage.py makemigrations network
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

#### Project Structure
```
network/
├── migrations/
├── static/network/
│   ├── styles.css
│   └── index.js
├── templates/network/
│   ├── layout.html
│   ├── index.html
│   ├── login.html
│   └── register.html
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── tests.py
├── urls.py
└── views.py
```
