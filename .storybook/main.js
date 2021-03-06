const path = require('path');

const purgecss = require('@fullhuman/postcss-purgecss')({

  // Specify the paths to all of the template files in your project
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
    // etc.
  ],

  // This is the function used to extract class names from your templates
  defaultExtractor: content => {
    // Capture as liberally as possible, including things like `h-(screen-1.5)`
    const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []

    // Capture classes within other delimiters like .block(class="w-1/2") in Pug
    const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []

    return broadMatches.concat(innerMatches)
  }
})

module.exports = {
  webpackFinal: async (config, {configType}) => {
    // `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', {
        loader: "css-loader",
        options: {
          importLoaders: 1,
          modules: false,
        },
      }, 'sass-loader'],
      // include: path.resolve(__dirname, '../'),
    });
    // Make whatever fine-grained changes you need
    config.module.rules.push({
      test: /\.css$/,
      use: [
        {
          loader: "postcss-loader",

          options: {
            ident: 'postcss',
            plugins: (loader) => [
              require('postcss-import')({root: loader.resourcePath}),
              require('postcss-preset-env')(),
              require('tailwindcss')('./tailwind.config.js'),
              require('cssnano')({
                preset: 'default',
              }),
              ...process.env.NODE_ENV === 'production'
                ? [purgecss]
                : []
            ]
          }

          // options: {
          //   importLoaders: 1,
          //   modules: false,
          //   /*Enable Source Maps*/
          //   sourceMap: true,
          //   /*Set postcss.config.js config path && ctx*/
          //
          //   config: {
          //     path: "./.storybook/",
          //   },
          // },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });

    config.node = {
      fs: 'empty'
    };

    // Return the altered config
    return config;
  },
  stories: ['../src/*.stories.(js|mdx)'],
  addons: [
    {
      name: '@storybook/addon-docs',
      options: {
        vueDocgenOptions: {
          alias: {
            '@': path.resolve(__dirname, '../src'),
          },
        },
      },
    },
    '@storybook/addon-storysource',
    '@storybook/addon-actions/register',
    '@storybook/addon-viewport/register',
    '@storybook/addon-knobs',
    '@storybook/addon-a11y',
    '@storybook/addon-links'
  ],
};
