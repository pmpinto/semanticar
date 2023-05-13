module.exports = (eleventyConfig) => {
  const md = require("markdown-it")({
    linkify: true,
    typographer: true
  });
  const mdAttrs = require("markdown-it-link-attributes");
  const siteData = require("./src/_data/site.json")

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
