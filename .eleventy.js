module.exports = (eleventyConfig) => {
  const md = require("markdown-it")({
    linkify: true,
    typographer: true,
    html: true
  });
  const mdAttrs = require("markdown-it-link-attributes");
  const mdTocAndAnchor = require('markdown-it-toc-and-anchor').default;
  const mdPlainText = require('markdown-it-plain-text');
  const siteData = require("./src/_data/site.json")
  const Image = require("@11ty/eleventy-img");
  const path = require("path");
  const he = require("he");
  const _chunk = require("lodash.chunk");

  // Prevent clashing with static_assets folder (which is git-ignored)
  eleventyConfig.setUseGitIgnore(false);

  // Copy static_assets folder to dist
  eleventyConfig.addPassthroughCopy("src/static_assets");

  // Register `markdownify` filter
  md.use(mdTocAndAnchor, {
    anchorLink: false,
    toc: true,
    tocClassName: 'toc__list',
    tocFirstLevel: 2,
    slugify: string => eleventyConfig.getFilter('slugify')(string)
  });
  md.use(mdAttrs, {
    matcher(href, config) {
      return href.startsWith("https://");
    },
    attrs: {
      target: "_blank",
      rel: "noopener noreferrer",
    },
  });
  md.use(mdPlainText)

  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addFilter("markdownify", (string) => {
    return md.renderInline(string);
  });
  eleventyConfig.addFilter("plainText", (string) => {
    md.render(string);
    const plainText = md.plainText.replace(/{%([^%}])*%}/g, '')
    return plainText
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
    return date.toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })
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
    const imageHTMLEscaped = wantsAbsoluteURL ? he.escape(imageHTML).replaceAll('https:/semanticar.pt', 'https://semanticar.pt') : imageHTML

    if (classname === 'post__body-image') {
      const baseClassname = classname.replace('-image', '')
      const figureHTML = `
        <figure class="${baseClassname}-figure">
          ${imageHTMLEscaped}
          <figcaption class="${baseClassname}-caption">${alt}</figcaption>
        </figure>
      `
      return figureHTML;
    }

    return imageHTMLEscaped
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
    const makes = posts.map((post) => post.data.make?.toLowerCase()).filter((make) => make)
    const uniqueMakes = [...new Set(makes)].sort();
    return uniqueMakes
  })

  // Register `getTotalPhotos` filter
  eleventyConfig.addFilter('getTotalPhotos', (posts) => {
    const photosLength = posts
      .filter((post) => post.data.photos)
      .map((post) => post.data.photos.length)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    return photosLength
  })

  // Register `where` filter
  // Returns 1 item of collection
  eleventyConfig.addFilter('where', (collection, field, value) => {
    if (!field || !value) {
      return collection
    }

    return collection.find((item) => item[field] === value)
  })

  // Register `whereList` filter
  // Returns a list
  eleventyConfig.addFilter('whereList', (collection, field, value) => {
    if (!field || !value) {
      return collection
    }

    return collection.filter((item) => {
      if (!item.data[field]) return false

      return item.data[field] === value || item.data[field].includes(value)
    })
  })

  // Register `without` filter
  // Removes an item from a collection
  eleventyConfig.addFilter('without', (collection, page) => {
    if (!page) {
      return collection
    }

    return collection.filter((item) => item.inputPath !== page.inputPath)
  })

  // Tag pagination
  // Src: https://github.com/11ty/eleventy/issues/332#issuecomment-445236776
  eleventyConfig.addCollection("tagPagination", function (collection) {
    // Get unique list of tags
    let tagSet = new Set();
    collection.getAllSorted().map(function (item) {
      if ("tags" in item.data) {
        let tags = item.data.tags;

        // optionally filter things out before you iterate over?
        for (let tag of tags) {
          tagSet.add(tag);
        }
      }
    });

    // Get each item that matches the tag
    let paginationSize = siteData.pagination.postsPerPage;
    let tagMap = [];
    let tagArray = [...tagSet].filter((tag) => tag !== 'post');
    for (let tagName of tagArray) {
      let tagItems = collection.getFilteredByTag(tagName).sort((a, b) => b.data.date - a.data.date);
      let pagedItems = _chunk(tagItems, paginationSize);
      // console.log( tagName, tagItems.length, pagedItems.length );
      for (let pageNumber = 0, max = pagedItems.length; pageNumber < max; pageNumber++) {
        tagMap.push({
          tagName: tagName,
          pageNumber: pageNumber,
          totalPages: pagedItems.length,
          items: pagedItems[pageNumber].reverse()
        });
      }
    }

    /* returns data looks like:
      [{
        tagName: "tag1",
        pageNumber: 0
        items: [] // array of items
      }]
    */
    //console.log( tagMap );
    return tagMap;
  });

  // Make pagination
  // Src: https://github.com/11ty/eleventy/issues/332#issuecomment-445236776
  eleventyConfig.addCollection("makePagination", function (collection) {
    // Get unique list of tags
    let tagSet = new Set();
    collection.getAllSorted().map(function (item) {
      if ("make" in item.data) {
        tagSet.add(item.data.make);
      }
    });

    // Get each item that matches the make
    let paginationSize = siteData.pagination.postsPerPage;
    let tagMap = [];
    let makeArray = [...tagSet]
    for (let makeName of makeArray) {
      let tagItems = collection.getAllSorted().reverse().filter((item) => item.data.make === makeName)
      let pagedItems = _chunk(tagItems, paginationSize);
      // console.log( makeName, tagItems.length, pagedItems.length );
      for (let pageNumber = 0, max = pagedItems.length; pageNumber < max; pageNumber++) {
        tagMap.push({
          makeName: makeName,
          pageNumber: pageNumber,
          totalPages: pagedItems.length,
          items: pagedItems[pageNumber].reverse()
        });
      }
    }

    /* returns data looks like:
      [{
        tagName: "tag1",
        pageNumber: 0
        items: [] // array of items
      }]
    */
    //console.log( tagMap );
    return tagMap;
  });

  // Register `with` filter
  // Returns an array
  eleventyConfig.addFilter('with', (collection, field) => {
    if (!field) {
      return collection
    }

    return collection.filter((item) => item.data.hasOwnProperty(field))
  })

  // Register `titleCase` filter
  // Returns a string with the first letter of each word in caps
  eleventyConfig.addFilter('titleCase', (string) => string.replace(/^(\w)/, (match) => match.toUpperCase()))


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
