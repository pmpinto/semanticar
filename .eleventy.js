module.exports = (eleventyConfig) => {
  const md = require("markdown-it")({
    linkify: true,
    typographer: true
  });
  const mdAttrs = require("markdown-it-link-attributes");
  const siteData = require("./src/_data/site.json")
  const Image = require("@11ty/eleventy-img");
  const path = require("path");
  const he = require("he");

  // Prevent clashing with static_assets folder (which is git-ignored)
  eleventyConfig.setUseGitIgnore(false);

  // Copy static_assets folder to dist
  eleventyConfig.addPassthroughCopy("src/static_assets");

  // Copy favicon stuff to dist
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/favicon-192.png");
  eleventyConfig.addPassthroughCopy("src/favicon-512.png");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/manifest.webmanifest");

  // Register `markdownify` filter
  md.use(mdAttrs, {
    matcher(href, config) {
      return href.startsWith("https://");
    },
    attrs: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  });

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("markdownify", (string) => {
    return md.renderInline(string);
  });

  // Register `unique` filter
  eleventyConfig.addFilter("unique", (list) => {
    const listStr = list.join();
    const sortedList = listStr.split(",").sort();
    const uniqueList = Array.from(new Set(sortedList));
    return uniqueList;
  });

  // Register `local_date` filter
  eleventyConfig.addFilter("local_date", (input) => {
    const date = new Date(input)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  });

  // Register `absolute_url` filter
  eleventyConfig.addFilter("absolute_url", (pageUrl) => `${siteData.url.slice(0, -1)}${pageUrl}`);

  // Register `image` tag
  // https://www.11ty.dev/docs/plugins/image/
  eleventyConfig.addShortcode("image", async function (src, alt, sizes, classname, wantsAbsoluteURL) {
    let metadata = await Image(src, {
      widths: ["auto", 384, 768, 1440, 2160],
      formats: ["jpeg"],
      urlPath: wantsAbsoluteURL ? 'https://semanticar.pt/static_assets/photos/' : '/static_assets/photos/',
      outputDir: './dist/static_assets/photos/',
      sharpJpegOptions: {
        quality: 80
      },
      filenameFormat: function (id, src, width, format, options) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `${name}-${width}w.${format}`;
      },
    });

    let imageAttributes = {
      alt,
      sizes,
      class: classname,
      loading: "lazy",
      draggable: "false",
      decoding: "async",
    };

    // You bet we throw an error on a missing alt (alt="" works okay)
    const imageHTML = Image.generateHTML(metadata, imageAttributes)

    return wantsAbsoluteURL ? he.escape(imageHTML).replaceAll('https:/semanticar.pt', 'https://semanticar.pt') : imageHTML;
  });

  // Register `image_url` filter
  // Based on the `image` tag, because we can't use `post.data.image` without it
  eleventyConfig.addFilter("image_url", async function (src) {
    let metadata = await Image(src, {
      widths: [1440],
      formats: ["jpeg"],
      urlFormat: function ({ hash, src, width, format }) {
        const extension = path.extname(src);
        const name = path.basename(src, extension);
        return `https://semanticar.pt/static_assets/photos/${name}-${width}w.${format}`;
      },
      outputDir: './dist/static_assets/photos/',
      sharpJpegOptions: {
        quality: 80
      }
    })

    return metadata.jpeg[metadata.jpeg.length - 1].url;
  });

  // Register `fromUntil` filter
  eleventyConfig.addFilter('fromUntil', (collection, start, end) => {
    if (!end) {
      return collection.splice(start)
    }

    return collection.splice(start, end)
  })

  // Register `getItem` filter
  eleventyConfig.addFilter('getItem', (collection, index) => {
    if (typeof index !== 'number') {
      throw new Error('The `getItem` filter needs an `index` to work with')
    }

    return collection[index]
  })

  // Register `local_date` filter
  eleventyConfig.addFilter('local_date', (input) => {
    const date = new Date(input)
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  // Register `getMakes` filter
  eleventyConfig.addFilter('getMakes', (posts) => {
    const makes = posts.map((post) => post.data.make).filter((make) => make)
    const uniqueMakes = [...new Set(makes)]
    return uniqueMakes
  })

  // Register `getTotalPhotos` filter
  eleventyConfig.addFilter('getTotalPhotos', (posts) => {
    const photos = posts.map((post) => post.data.photos).flat()
    return photos.length
  })

  return {
    dir: {
      input: "src",
      output: "dist",
      layouts: "_layouts",
      data: "_data",
      includes: "_includes",
    },
    dataTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk,md",
    setUseGitIgnore: false,
  };
};
