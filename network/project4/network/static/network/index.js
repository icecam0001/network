
document.addEventListener('DOMContentLoaded', function() {
    // Make post form listener
    document.querySelector('#makepost').addEventListener("submit", make_post);
    
    // Pagination button listeners
    document.querySelector('#prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            load_posts(currentView, currentPage - 1);
        }
    });

    document.querySelector('#next-page').addEventListener('click', () => {
        load_posts(currentView, currentPage + 1);
    });
    
    // Initial load - only once!
    load_posts('all');
});
  let post = document.querySelector("#makepost")
  
  function make_post(event) {
    event.preventDefault();
    let content = document.querySelector('#post').value;
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
    // Add console.log to see what we're sending
    console.log("Sending content:", content);
    console.log("CSRF token:", csrftoken);

    fetch('/make', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content
        })
    })
    .then(response => {
        // Add this to see the raw response
        console.log("Raw response:", response);
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            return response.text().then(text => {
                console.log("Error response text:", text);
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            });
        }
        return response.json();
    })
    .then(result => {
        console.log("Success:", result);
        load_posts('all');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
let currentPage = 1;
let currentView = 'all';

function load_posts(type, page = 1) {
    document.querySelector('#posts-view').innerHTML = '';
    document.querySelector('#formy').innerHTML=''
    currentView = type;
    currentPage = page;

    fetch(`/posts/${type}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.log(data.error);
            return;
        }
        
        // Update posts
        data.posts.forEach(post => {
            add_post(post);
        });
        
        // Update pagination controls
        document.querySelector('#page-info').textContent = `Page ${data.page} of ${data.total_pages}`;
        document.querySelector('#prev-page').disabled = !data.has_previous;
        document.querySelector('#next-page').disabled = !data.has_next;
    });
}


function add_post(post) {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `
        <div class="post-user" style="cursor: pointer;">${post.user}</div>
        <div class="post-content">${post.content}</div>
        <div class="post-timestamp">${post.timestamp}</div>
        <div class="post-likes">Likes: ${post.likes.length}</div>
    `;    

    // Add click handler for username - but only once!
    const userElement = div.querySelector('.post-user');
    userElement.addEventListener('click', (e) => {
        e.preventDefault();
        load_user(post.user);
    });
    
    const button = document.createElement('button');
    button.innerHTML = "Like";
    button.className = 'like-button';
    const currentUser = document.querySelector('.navbar-nav strong')?.textContent || '';

// Then compare with post.user
    if (post.user === currentUser) {
        const edit = document.createElement('button');
        edit.innerHTML = "Edit";
        edit.className = 'edit-button';
        div.append(edit)
        edit.addEventListener('click', () => render_updateform(post))  

        }
    button.addEventListener('click', function() {
        const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
    
        fetch(`/posts/${post.id}/like`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrftoken
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            post.likes = data.likes;
            div.querySelector('.post-likes').innerHTML = `Likes: ${post.likes.length}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
    
    div.appendChild(button);
    document.querySelector('#posts-view').appendChild(div);
}
function render_updateform(post) {
    document.querySelector('#posts-view').innerHTML = '';
    let divy = document.querySelector('#formy');
    let div = document.createElement('div');
    div.innerHTML = `
        <form id="update-form">
            <input type="hidden" name="csrfmiddlewaretoken" value="${document.querySelector('[name=csrfmiddlewaretoken]').value}">
            <input type="text" id="update-content" class="form-control">
            <button type="submit" class="btn btn-primary">Update</button>
        </form>
    `;
    divy.append(div);
    
    div.querySelector('#update-form').addEventListener('submit', function(e) {
        e.preventDefault();
        let content = document.querySelector('#update-content').value;
        fetch(`/posts/${post.id}/edit`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({
                content: content
            })
        })
        .then(response => response.json())
        .then(data => {
            load_posts('all'); // Reload posts after update
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}
function load_user(username) {
    // Fetch user profile
    fetch(`/profile/${username}`)
        .then(response => response.json())
        .then(profile => {
            // Clear current view
            document.querySelector('#posts-view').innerHTML = '';
            
            // Create profile section
            const profileDiv = document.createElement('div');
            profileDiv.className = 'profile-section';
            profileDiv.innerHTML = `
                <h2>${profile.username}'s Profile</h2>
                <p>Followers: ${profile.followers.length} | Following: ${profile.following.length}</p>
            `;

            // Add follow button if not viewing own profile
            if (!profile.same_user) {
                const followBtn = document.createElement('button');
                followBtn.innerHTML = profile.is_following ? 'Unfollow' : 'Follow';
                followBtn.addEventListener('click', () => {
                    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                    fetch(`/follow/${username}`, {
                        method: 'PUT',
                        headers: {
                            'X-CSRFToken': csrftoken
                        }
                    })
                    .then(response => response.json())
                    .then(data => {
                        followBtn.innerHTML = data.is_following ? 'Unfollow' : 'Follow';
                    });
                });
                profileDiv.appendChild(followBtn);
            }

            // Add profile to page
            document.querySelector('#posts-view').appendChild(profileDiv);

            // Now fetch the user's posts
            fetch(`/posts/user?page=1`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.log(data.error);
                        return;
                    }
                    
                    // Create a container for posts
                    const postsContainer = document.createElement('div');
                    postsContainer.id = 'user-posts';
                    
                    // Add each post
                    data.posts.forEach(post => {
                        const postDiv = document.createElement('div');
                        postDiv.className = 'post';
                        postDiv.innerHTML = `
                            <div class="post-content">${post.content}</div>
                            <div class="post-timestamp">${post.timestamp}</div>
                            <div class="post-likes">Likes: ${post.likes.length}</div>
                        `;
                        postsContainer.appendChild(postDiv);
                    });
                    
                    document.querySelector('#posts-view').appendChild(postsContainer);
                });
        });
}