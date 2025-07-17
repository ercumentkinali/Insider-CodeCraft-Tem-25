        $(document).ready(function() {
            let currentPage = 0;
            const postsPerPage = 5;
            let isLoading = false;
            let hasMorePosts = true;
            let totalPosts = 0;

            loadPosts();

            $(window).scroll(function() {
                if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
                    if (!isLoading && hasMorePosts) {
                        loadPosts();
                    }
                }
            });

            function loadPosts() {
                if (isLoading || !hasMorePosts) return;

                isLoading = true;
                $('#loading').show();
                $('#error').hide();

                const startIndex = currentPage * postsPerPage;

                $.get(`https://jsonplaceholder.typicode.com/posts?_start=${startIndex}&_limit=${postsPerPage}`)
                    .done(function(posts) {
                        if (posts.length === 0) {
                            hasMorePosts = false;
                            $('#endMessage').show();
                        } else {
                            displayPosts(posts);
                            currentPage++;
                            totalPosts += posts.length;
                            updateStats();
                        }
                    })
                    .fail(function() {
                        $('#error').show();
                    })
                    .always(function() {
                        isLoading = false;
                        $('#loading').hide();
                    });
            }

            function displayPosts(posts) {
                posts.forEach(function(post, index) {
                    const postElement = $(`
                        <div class="post" style="animation-delay: ${index * 0.1}s">
                            <div class="post-id">Post #${post.id}</div>
                            <div class="post-title">${post.title}</div>
                            <div class="post-body">${post.body}</div>
                        </div>
                    `);
                    
                    $('#postContainer').append(postElement);
                });
            }

            function updateStats() {
                $('#postCount').text(totalPosts);
            }

            $('#error').click(function() {
                loadPosts();
            });
        });
