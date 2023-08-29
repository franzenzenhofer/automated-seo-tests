const markdownItContainer = require('markdown-it-container');

module.exports = ({ marp }) => {
  // Define the custom rendering function for the slideInner container
  const slideInnerContainer = {
    validate: params => params.trim().match(/^slideInner\s*(.*)$/),
    render: (tokens, idx) => {
      const token = tokens[idx];
      const params = token.info.trim().split(/\s+/);
      
      if (token.nesting === 1) {
        // opening tag
        const classes = params.length > 1 ? params.slice(1).join(' ') : '';
        return `<div class="slideInner ${classes}">\n`;
      } else {
        // closing tag
        return '</div>\n';
      }
    }
  };

  // Define the custom rendering function for the col container
  const colContainer = {
    validate: params => params.trim().match(/^col\s*(.*)$/),
    render: (tokens, idx) => {
      if (tokens[idx].nesting === 1) {
        // opening tag
        return '<div class="col">\n';
      } else {
        // closing tag
        return '</div>\n';
      }
    }
  };

  marp.use(markdownItContainer, 'slideInner', slideInnerContainer);
  marp.use(markdownItContainer, 'col', colContainer);

  return marp;
};
