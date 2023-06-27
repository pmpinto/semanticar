const fs = require('fs')
const md = require("markdown-it")({
  linkify: true,
  typographer: true
});
const mdAttrs = require("markdown-it-link-attributes");
const siteData = require("./src/_data/site.json")
const Image = require("@11ty/eleventy-img");
const path = require("path");
const he = require("he");
const _chunk = require("lodash.chunk");
// const EleventyPluginOgImage = require('eleventy-plugin-og-image');

module.exports = (eleventyConfig) => {
  // Prevent clashing with static_assets folder (which is git-ignored)
  eleventyConfig.setUseGitIgnore(false);

  // Copy static_assets folder to dist
  eleventyConfig.addPassthroughCopy("src/static_assets");

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

  // // Set up dynamic OG images
  // eleventyConfig.addPlugin(EleventyPluginOgImage, {
  //   satoriOptions: {
  //     width: 2000,
  //     height: 1000,
  //     fonts: [],
  //   },
  //   generateHTML: (outputUrl) => outputUrl
  // });


  // // Register `base64Image` tag
  // eleventyConfig.addNunjucksShortcode("base64Image", (path) => {
  //   const file = fs.readFileSync(path);
  //   return `data:image/jpeg;base64,${file.toString('base64')}`;
  // });

  // Transform OG images from SVG into JPG
  eleventyConfig.on('afterBuild', () => {
    const socialPreviewImagesDir = "dist/static_assets/images/metadata/post/";
    fs.readdir(socialPreviewImagesDir, function (err, files) {
      if (files.length > 0) {
        files.forEach(function (filename) {
          if (filename.endsWith(".svg")) {
            let imageUrl = socialPreviewImagesDir + filename;
            Image(imageUrl, {
              formats: ["jpeg"],
              outputDir: "./" + socialPreviewImagesDir,
              filenameFormat: function (id, src, width, format, options) {
                let outputFilename = filename.substring(0, (filename.length - 4));
                return `${outputFilename}.${format}`;
              }
            });
          }
        })
      }
    })
  });

  // Register `getBiggestVersion` filter
  // Get biggest image version from cover path
  eleventyConfig.addFilter('getBiggestVersion', (image) => {
    const folder = 'dist/static_assets/photos/'
    const filename = path.basename(image)
    const extension = path.extname(filename)

    const allFiles = fs.readdirSync(folder)
    const relevantFiles = allFiles.filter((name) => name.startsWith(`${filename.replace(extension, '')}`))
    const imagePath = `../../../${folder.replace('dist/static_assets/', '')}${relevantFiles[0]}`

    console.log('⚠️ relevantPath', imagePath)
    // ../../../photos/citroen-ami-buggy-1200w.jpeg
    // ../../../static_assets/photos/photo-1572375180666-c23ef8bef639-1440w.jpeg
    return imagePath
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
