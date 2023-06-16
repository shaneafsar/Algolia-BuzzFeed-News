const searchClient = algoliasearch(
  'KMDXFFOEOY', 
  'caa3c01fe6026e7bb4086912531e73d5'
);

const search = instantsearch({
  indexName: 'buzzfeed_BuzzFeedNews',
  searchClient,
  insights: true,
});

function formatDate(num) {
  return (new Date(num*1000)).toLocaleDateString('en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"});
}

function renderPublishDate(hit, html) {
  if (hit.date === 0) {
    return '';
  }

  return html`<p class="text-sm text-gray-500 mb-2">Publish Date: ${formatDate(hit.date)}</p>`;
}

function renderAuthor(hit, html, components) {
  if (!hit.author) {
    return '';
  }

  return html`<p class="text-sm text-gray-500 mb-2">Author: ${components.Highlight({ hit, attribute: 'author' })}</p>`;
}

search.addWidgets([
  instantsearch.widgets.configure({
    filters: 'NOT type:"website"',
  }),
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  }),
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components, sendEvent }) => html`
        <article class="flex flex-wrap">
          <div class="w-full md:w-1/4 mb-4 md:mb-0">
            <img src="${hit.image}" class="w-full h-48 object-cover" alt="Article Image" />
          </div>
          <div class="w-full md:w-3/4 md:pl-4">
            <h2 class="text-2xl font-semibold mb-2 text-blue-500 hover:text-blue-700 transition duration-150 ease-in-out"><a href="${hit.url}" onClick="${() => sendEvent('click', hit, 'Article Clicked')}" target="_blank">${components.Highlight({ hit, attribute: 'title' })}</a></h2>
            <p class="text-gray-700 mb-2">${components.Highlight({ hit, attribute: 'description' })}</p>
             ${renderAuthor(hit, html, components)}
             ${renderPublishDate(hit, html)}
            <div class="mb-2">
                <span class="text-sm font-semibold text-gray-700">Page Headings: </span>
                <span class="text-sm text-gray-600">${components.Highlight({ hit, attribute: 'headers' })}
                </span>
            </div>
            <p class="text-gray-800">${components.Highlight({ hit, attribute: 'content' })}</p>
          </div>
        </article>
      `,
    },
  }),
  instantsearch.widgets.configure({
    hitsPerPage: 8,
  }),
  instantsearch.widgets.poweredBy({
    container: '#powered-by',
  }),
  instantsearch.widgets.panel({
    templates: { header: 'Author' },
  })(instantsearch.widgets.refinementList)({
    container: '#author-list',
    attribute: 'author'
  }),
  instantsearch.widgets.panel({
    templates: { header: 'Date' },
  })(instantsearch.widgets.refinementList)({
    container: '#date-list',
    attribute: 'date',
    transformItems(items) {
      return items.map(item => { 
        if (item.label === '0') { 
          const label = 'No date';
          item.label = label;
          item.highlighted = label;
        } else {
          const label = formatDate(item.label);
          item.label = label;
          item.highlighted = label;
        } 
        return item; 
      });
    }
  }),
  instantsearch.widgets.pagination({
    container: '#pagination',
  }),
]);

search.start();