// Sample gallery items (you can replace these with your own media)
let galleryItems = JSON.parse(localStorage.getItem('galleryItems')) || [
    {
        type: 'image',
        src: 'https://source.unsplash.com/random/800x600?nature',
        title: 'Nature Scene',
        description: 'Beautiful nature landscape',
        isDefault: true
    },
    {
        type: 'video',
        src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: 'Sample Video',
        description: 'A sample video clip',
        isDefault: true
    },
    {
        type: 'image',
        src: 'https://source.unsplash.com/random/800x600?city',
        title: 'City View',
        description: 'Urban landscape',
        isDefault: true
    },
    {
        type: 'image',
        src: 'https://source.unsplash.com/random/800x600?technology',
        title: 'Technology',
        description: 'Modern technology',
        isDefault: true
    },
    {
        type: 'video',
        src: 'https://www.w3schools.com/html/mov_bbb.mp4',
        title: 'Another Video',
        description: 'Another sample video',
        isDefault: true
    }
];

// DOM Elements
const galleryContainer = document.querySelector('.gallery-container');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.querySelector('.lightbox-content');
const closeLightbox = document.querySelector('.close-lightbox');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const filterButtons = document.querySelectorAll('.filter-btn');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

let currentIndex = 0;
let filteredItems = [...galleryItems];

// Initialize gallery
function initGallery() {
    renderGalleryItems(galleryItems);
    setupEventListeners();
}

// Save gallery items to localStorage
function saveGalleryItems() {
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
}

// Render gallery items
function renderGalleryItems(items) {
    galleryContainer.innerHTML = '';
    items.forEach((item, index) => {
        const galleryItem = createGalleryItem(item, index);
        galleryContainer.appendChild(galleryItem);
    });
}

// Create gallery item element
function createGalleryItem(item, index) {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.setAttribute('data-index', index);

    const media = item.type === 'image' 
        ? `<img src="${item.src}" alt="${item.title}">`
        : `<video src="${item.src}" controls></video>`;

    const deleteBtn = !item.isDefault ? 
        `<button class="delete-btn" title="Delete">×</button>` : '';

    div.innerHTML = `
        ${media}
        <div class="overlay">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
        ${deleteBtn}
    `;

    // Add delete button event listener if it exists
    const deleteButton = div.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(index);
        });
    }

    return div;
}

// Delete gallery item
function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        // Find the actual index in galleryItems
        const itemToDelete = filteredItems[index];
        const actualIndex = galleryItems.findIndex(item => item === itemToDelete);
        
        if (actualIndex !== -1) {
            galleryItems.splice(actualIndex, 1);
            saveGalleryItems();
            
            // Update filtered items
            filteredItems = filteredItems.filter((_, i) => i !== index);
            
            // Update current index if needed
            if (currentIndex >= filteredItems.length) {
                currentIndex = Math.max(0, filteredItems.length - 1);
            }
            
            renderGalleryItems(filteredItems);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Gallery item click
    galleryContainer.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            const index = parseInt(galleryItem.getAttribute('data-index'));
            openLightbox(index);
        }
    });

    // Close lightbox
    closeLightbox.addEventListener('click', closeLightboxView);

    // Navigation buttons
    prevBtn.addEventListener('click', () => navigateLightbox('prev'));
    nextBtn.addEventListener('click', () => navigateLightbox('next'));

    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            filterGallery(filter);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('active')) {
            if (e.key === 'ArrowLeft') navigateLightbox('prev');
            if (e.key === 'ArrowRight') navigateLightbox('next');
            if (e.key === 'Escape') closeLightboxView();
        }
    });

    // File upload handling
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);
}

// Handle file uploads
function handleFileUpload(e) {
    const files = e.target.files;
    
    for (let file of files) {
        const fileType = file.type;
        const isImage = fileType.startsWith('image/');
        const isVideo = fileType.startsWith('video/');
        
        if (isImage || isVideo) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const newItem = {
                    type: isImage ? 'image' : 'video',
                    src: event.target.result,
                    title: file.name,
                    description: `Uploaded ${isImage ? 'image' : 'video'}`,
                    isDefault: false
                };
                
                galleryItems.unshift(newItem);
                saveGalleryItems();
                filteredItems = [...galleryItems];
                renderGalleryItems(filteredItems);
            };
            reader.readAsDataURL(file);
        } else {
            alert('Please upload only image or video files.');
        }
    }
    
    // Reset file input
    fileInput.value = '';
}

// Open lightbox
function openLightbox(index) {
    // Make sure the index is within bounds of filtered items
    if (index >= 0 && index < filteredItems.length) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add('active');
    }
}

// Close lightbox
function closeLightboxView() {
    lightbox.classList.remove('active');
}

// Navigate lightbox
function navigateLightbox(direction) {
    if (filteredItems.length === 0) return;

    if (direction === 'prev') {
        currentIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    } else {
        currentIndex = (currentIndex + 1) % filteredItems.length;
    }
    updateLightboxContent();
}

// Update lightbox content
function updateLightboxContent() {
    if (filteredItems.length === 0) {
        lightboxContent.innerHTML = '<p class="no-content">No items to display</p>';
        return;
    }

    const item = filteredItems[currentIndex];
    const media = item.type === 'image'
        ? `<img src="${item.src}" alt="${item.title}">`
        : `<video src="${item.src}" controls></video>`;

    const deleteBtn = !item.isDefault ? 
        `<button class="delete-btn" title="Delete">×</button>` : '';

    lightboxContent.innerHTML = `
        ${media}
        <div class="lightbox-info">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
        ${deleteBtn}
    `;

    // Add delete button event listener if it exists
    const deleteButton = lightboxContent.querySelector('.delete-btn');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            deleteItem(currentIndex);
            closeLightboxView();
        });
    }
}

// Filter gallery
function filterGallery(filter) {
    // Update active filter button
    filterButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-filter') === filter);
    });

    // Filter items
    filteredItems = filter === 'all'
        ? [...galleryItems]  // Create a new array to avoid reference issues
        : galleryItems.filter(item => item.type === filter);

    // Reset current index to 0 when filtering
    currentIndex = 0;

    // Render filtered items
    renderGalleryItems(filteredItems);

    // Update lightbox content if it's open
    if (lightbox.classList.contains('active')) {
        updateLightboxContent();
    }
}

// Initialize the gallery when the page loads
document.addEventListener('DOMContentLoaded', initGallery); 