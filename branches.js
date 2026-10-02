const branchSearch = document.getElementById('branchSearch');
const branchGrid = document.getElementById('branchGrid');

function escapeBranchHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[character]));
}

function renderBranches(branches) {
  const search = (branchSearch?.value || '').trim().toLowerCase();
  const visibleBranches = branches.filter((branch) => {
    const searchable = `${branch.name || ''} ${branch.map_url || ''}`.toLowerCase();
    return !search || searchable.includes(search);
  });

  if (!visibleBranches.length) {
    branchGrid.innerHTML = '<p class="branch-message">No branches match your search.</p>';
    return;
  }

  branchGrid.innerHTML = visibleBranches.map((branch) => {
    const name = escapeBranchHtml(branch.name);
    const mapUrl = escapeBranchHtml(branch.map_url);
    const status = String(branch.status || 'active').toLowerCase();
    const mapQuery = encodeURIComponent(branch.name || 'ChaJoy branch');
    const fullMapUrl = mapUrl || `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
    const coordinates = mapUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    const mapFrame = status !== 'upcoming' && coordinates
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(coordinates[2]) - 0.01}%2C${Number(coordinates[1]) - 0.01}%2C${Number(coordinates[2]) + 0.01}%2C${Number(coordinates[1]) + 0.01}&layer=mapnik&marker=${coordinates[1]}%2C${coordinates[2]}`
      : '';
    const mapUnavailableMessage = status === 'upcoming'
      ? 'Map unavailable - this branch is coming soon.'
      : 'ChaJoy location';

    return `
      <article class="branch-card">
        ${mapFrame
          ? `<iframe class="branch-map" src="${mapFrame}" title="${name} location map" loading="lazy"></iframe>`
          : '<div class="branch-map" role="img" aria-label="' + name + ' location map"><span>' + mapUnavailableMessage + '</span></div>'}
        <div class="branch-card-body">
          <h3>${name}</h3>
          <p class="branch-location">${status === 'upcoming' ? 'Map unavailable - branch coming soon' : (mapUrl ? 'Location available' : 'Location coming soon')}</p>
          <span class="branch-status ${escapeBranchHtml(status)}">${escapeBranchHtml(status)}</span>
          ${status === 'upcoming' ? '' : `<div class="branch-actions"><a href="${fullMapUrl}" target="_blank" rel="noopener">Open Full Map</a></div>`}
        </div>
      </article>`;
  }).join('');
}

async function loadBranches() {
  try {
    const response = await fetch('public/branches.php', { credentials: 'same-origin' });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      throw new Error(result.message || 'Unable to load branches.');
    }
    renderBranches(Array.isArray(result.data) ? result.data : []);
  } catch (error) {
    branchGrid.innerHTML = `<p class="branch-message">${escapeBranchHtml(error.message)}</p>`;
  }
}

branchSearch?.addEventListener('input', () => loadBranches());
loadBranches();
