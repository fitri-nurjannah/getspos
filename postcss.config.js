module.exports = {
  plugins: [
    // Pre-plugin: automatically inject @reference into component CSS files using @apply
    {
      postcssPlugin: 'tailwind-v4-auto-reference',
      Once(root, { result }) {
        const file = result.opts.from || '';
        // Skip root styles.css (it already imports tailwindcss)
        if (file.includes('styles.css')) return;

        const cssText = root.toString();
        if (cssText.includes('@apply') && !cssText.includes('@reference') && !cssText.includes('@import')) {
          root.prepend({ text: 'reference "tailwindcss";', raws: { before: '\n', after: '\n' }, name: 'reference', params: '"tailwindcss"' });
        }
      }
    },
    require('@tailwindcss/postcss')()
  ]
};
module.exports.postcss = true;