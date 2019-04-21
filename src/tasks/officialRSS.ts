import { Task } from 'klasa';
import * as Parser from 'rss-parser';
import fetch from 'node-fetch';
import config from '../../config';

export default class extends Task {
  async run(): Promise<null> {
    const parser = new Parser();
    const feed = await parser
      .parseURL('https://www.vainglorygame.com/feed/')
      .catch(() => null);
    if (!feed || !feed.items || !feed.items.length) return null;

    const officialNews = feed.items.map((item: any) => {
      const image = item["content:encoded"].indexOf('src="') >= 0
        ? item["content:encoded"].substring(
          item["content:encoded"].indexOf('src="') + 5,
          item["content:encoded"].indexOf('alt="') - 2
        )
        : "https://media.giphy.com/media/2uIfi72zJRvXKZNM1R/giphy.gif";
      return {
        author: `${item.creator.toUpperCase()} On ${item.pubDate.substring(0, item.pubDate.length - 15)}`,
        title: item.title.toUpperCase(),
        link: item.link,
        category: 'official',
        path: '/',
        timestamp: Date.now(),
        image:
          image.includes('flywheelsites.com') ? "https://media.giphy.com/media/2uIfi72zJRvXKZNM1R/giphy.gif" : image,
      }
    });

    // https://vainglorygame.flywheelsites.com/wp-content/uploads/2019/02/SanFeng_YinYang_Splash.jpg

    let hasNewPost = false;

    const allPostsInDB = await this.client.providers.default.get('posts', 'officialNews');

    for (const news of officialNews) {
      const isNew = allPostsInDB.news.find((post: any) => post.title.toUpperCase() === news.title);
      if (isNew) continue;

      hasNewPost = true;
    }
    if (!hasNewPost) return null;
    // Update the database with the new data
    console.log('updating')
    const updated = await this.client.providers.default
      .update('posts', 'officialNews', { news: officialNews })
      .catch((error) => {
        this.client.console.error(error);
        return null;
      });

    // Tell netlify to rebuild the website if the db was updated
    if (updated) await fetch(config.netlifyUpdateWebhook, { method: 'POST' });

    return null;
  }

  async init(): Promise<any> {
    // If reminder task doesnt exist on startup create it every 10 minutes
    if (!this.client.schedule.tasks.find((t) => t.taskName === 'officialRSS'))
      this.client.schedule.create('officialRSS', '*/1 * * * *');
    return null;
  }
}
