document.addEventListener('DOMContentLoaded', () => {
    //  Search/filter your posts
    const searchMine = document.getElementById('searchMine');
    if (searchMine) {
      searchMine.addEventListener('keyup', () => {
        const filter = searchMine.value.toUpperCase();
        document.querySelectorAll('#postsContainer article').forEach(article => {
          const text = article.textContent.toUpperCase();
          article.style.display = text.includes(filter) ? '' : 'none';
        });
      });
    }
  
    // Wire up Edit buttons
    document.querySelectorAll('button.edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const article = e.target.closest('article');
        document.getElementById('title').value   = article.querySelector('h3').textContent;
        document.getElementById('content').value = article.querySelector('div').textContent;
        document.getElementById('postId').value  = article.dataset.id;
        document.getElementById('postForm')
                .scrollIntoView({ behavior: 'smooth' });
      });
    });
  });
  