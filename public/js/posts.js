document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search');
    if (!searchBar) return;
  
    searchBar.addEventListener('keyup', () => {
      const filter = searchBar.value.toUpperCase();
      document.querySelectorAll('#postsContainer article').forEach(article => {
        const text = article.textContent.toUpperCase();
        article.style.display = text.includes(filter) ? '' : 'none';
      });
    });
  });
  