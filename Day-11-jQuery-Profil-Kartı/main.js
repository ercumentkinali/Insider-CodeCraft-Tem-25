
        $(document).ready(function() {
            let currentProfiles = [];
            let isSliderInitialized = false;

            loadProfiles();

            $('#loadProfilesBtn').click(function() {
                $(this).addClass('bounce');
                setTimeout(() => $(this).removeClass('bounce'), 600);
                loadProfiles();
            });
            
            $('#clearProfilesBtn').click(function() {
                $(this).addClass('shake');
                setTimeout(() => $(this).removeClass('shake'), 500);
                clearProfiles();
            });

            function loadProfiles() {
                $('#loadingIndicator').removeClass('hidden');
                $('#profilesGrid').empty();
                
                if (isSliderInitialized) {
                    $('#profilesSlider').slick('destroy');
                    isSliderInitialized = false;
                }
                $('#profilesSlider').empty();

                $.ajax({
                    url: 'https://randomuser.me/api/?results=12',
                    dataType: 'json',
                    success: function(data) {
                        currentProfiles = data.results;
                        $('#loadingIndicator').addClass('hidden');
                        displayProfiles();
                        setupSlider();
                    },
                    error: function() {
                        $('#loadingIndicator').addClass('hidden');
                        alert('Profiller yüklenirken bir hata oluştu!');
                    }
                });
            }

            function displayProfiles() {
                currentProfiles.forEach((profile, index) => {
                    const profileCard = $(createProfileCard(profile, index));
                    profileCard.hide();
                    $('#profilesGrid').append(profileCard);
                    profileCard.delay(index * 100).fadeIn(400);
                });

                $('.profile-card').click(function() {
                    const profileIndex = $(this).data('index');
                    const profile = currentProfiles[profileIndex];
                    showProfileModal(profile);
                });

                $('.profile-card').hover(
                    function() {
                        $(this).fadeTo(200, 0.8);
                        $(this).find('.profile-avatar').stop(true).animate({ borderColor: '#667eea', width: '110px', height: '110px' }, 200);
                    },
                    function() {
                        $(this).fadeTo(200, 1);
                        $(this).find('.profile-avatar').stop(true).animate({ borderColor: '#f0f0f0', width: '100px', height: '100px' }, 200);
                    }
                );
            }


            function createProfileCard(profile, index) {
                const fullName = `${profile.name.first} ${profile.name.last}`;
                const location = `${profile.location.city}, ${profile.location.country}`;
                const age = profile.dob.age;
                const phone = profile.phone;
                
                return `
                    <div class="profile-card" data-index="${index}">
                        <img src="${profile.picture.large}" alt="${fullName}" class="profile-avatar">
                        <div class="profile-name">${fullName}</div>
                        <div class="profile-email">${profile.email}</div>
                        <div class="profile-location">
                            <i class="fas fa-map-marker-alt"></i> ${location}
                        </div>
                        <div class="profile-details">
                            <div class="profile-detail">
                                <i class="fas fa-birthday-cake"></i>
                                <span>${age} yaşında</span>
                            </div>
                            <div class="profile-detail">
                                <i class="fas fa-phone"></i>
                                <span>Telefon</span>
                            </div>
                            <div class="profile-detail">
                                <i class="fas fa-venus-mars"></i>
                                <span>${profile.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }

            function setupSlider() {
                currentProfiles.forEach((profile, index) => {
                    const fullName = `${profile.name.first} ${profile.name.last}`;
                    const sliderCard = `
                        <div class="slider-card" data-index="${index}">
                            <img src="${profile.picture.large}" alt="${fullName}" class="profile-avatar">
                            <div class="profile-name">${fullName}</div>
                            <div class="profile-email">${profile.email}</div>
                        </div>
                    `;
                    $('#profilesSlider').append(sliderCard);
                });

                $('#profilesSlider').slick({
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 3000,
                    dots: true,
                    arrows: true,
                    responsive: [
                        {
                            breakpoint: 768,
                            settings: {
                                slidesToShow: 1,
                                slidesToScroll: 1
                            }
                        }
                    ]
                });

                isSliderInitialized = true;

                $('.slider-card').click(function() {
                    const profileIndex = $(this).data('index');
                    const profile = currentProfiles[profileIndex];
                    showProfileModal(profile);
                });
            }

            function showProfileModal(profile) {
                const fullName = `${profile.name.first} ${profile.name.last}`;
                const location = `${profile.location.city}, ${profile.location.state}, ${profile.location.country}`;
                const birthDate = new Date(profile.dob.date).toLocaleDateString('tr-TR');
                
                const modalContent = `
                    <div class="modal-content">
                        <img src="${profile.picture.large}" alt="${fullName}" class="modal-avatar">
                        <h2 class="profile-name">${fullName}</h2>
                        <p class="profile-email">${profile.email}</p>
                        
                        <div class="modal-details">
                            <div class="modal-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${location}</span>
                            </div>
                            <div class="modal-detail">
                                <i class="fas fa-phone"></i>
                                <span>${profile.phone}</span>
                            </div>
                            <div class="modal-detail">
                                <i class="fas fa-mobile-alt"></i>
                                <span>${profile.cell}</span>
                            </div>
                            <div class="modal-detail">
                                <i class="fas fa-birthday-cake"></i>
                                <span>${birthDate} (${profile.dob.age} yaşında)</span>
                            </div>
                            <div class="modal-detail">
                                <i class="fas fa-venus-mars"></i>
                                <span>${profile.gender === 'male' ? 'Erkek' : 'Kadın'}</span>
                            </div>
                            <div class="modal-detail">
                                <i class="fas fa-id-card"></i>
                                <span>Kimlik: ${profile.login.username}</span>
                            </div>
                        </div>
                    </div>
                `;

                $.fancybox.open({
                    src: modalContent,
                    type: 'html',
                    opts: {
                        animationEffect: 'fade',
                        animationDuration: 300,
                        buttons: ['close']
                    }
                });
            }

            function clearProfiles() {
                $('.profile-card').each(function(index) {
                    setTimeout(() => {
                        $(this).removeClass('visible');
                    }, index * 50);
                });

                setTimeout(() => {
                    $('#profilesGrid').empty();
                    if (isSliderInitialized) {
                        $('#profilesSlider').slick('destroy');
                        isSliderInitialized = false;
                    }
                    $('#profilesSlider').empty();
                    currentProfiles = [];
                }, 500);
            }
        });