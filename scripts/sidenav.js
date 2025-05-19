/**
 * sidenav.js - Handles the sidebar navigation toggle functionality
 * This script enables expanding and collapsing the sidebar when clicking on the toggle icon
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const sidebarToggle = document.getElementById('sidenav-toggle');
    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');
    
    // Default to collapsed state unless explicitly set to expanded in localStorage
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') !== 'false';
    
    // Apply the state on page load (collapsed by default)
    if (sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
    }
    
    // Toggle sidebar when clicking the icon
    sidebarToggle.addEventListener('click', function() {
        // Toggle the collapsed class on the sidebar
        sidebar.classList.toggle('collapsed');
        
        // Toggle the expanded class on the content
        content.classList.toggle('expanded');
        
        // Store the current state in localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    });
    
    // Add event listener for sidebar links to ensure they work properly on mobile
    const sidebarLinks = sidebar.querySelectorAll('a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            // On mobile or when collapsed, close the sidebar when a link is clicked
            if (window.innerWidth <= 768 || sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
                content.classList.add('expanded');
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        });
    });
    
    // Add responsive behavior
    window.addEventListener('resize', function() {
        // Auto-collapse sidebar on small screens
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
            content.classList.add('expanded');
        }
    });
    
    // Initially trigger a resize event to handle mobile devices
    if (window.innerWidth <= 768) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
    }
});