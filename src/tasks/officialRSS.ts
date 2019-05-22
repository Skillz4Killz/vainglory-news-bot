import { Task } from 'klasa';
import * as Parser from 'rss-parser';
import fetch from 'node-fetch';
import config from '../../config';

const defaultImages = [
  'https://i.imgur.com/vB9FrA0.jpg',
  'https://i.imgur.com/qz14h4k.jpg',
];

export default class extends Task {
  async run(): Promise<null> {
    const parser = new Parser();
    const feed = await parser
      .parseURL('https://www.vainglorygame.com/feed/')
      .catch(() => null);
    if (!feed || !feed.items || !feed.items.length) return null;
    const randomDefaultImage =
      defaultImages[Math.floor(Math.random() * defaultImages.length)];

    const officialNews = feed.items.map((item: any) => {
      const image =
        item['content:encoded'].indexOf('src="') >= 0
          ? item['content:encoded'].substring(
              item['content:encoded'].indexOf('src="') + 5,
              item['content:encoded'].indexOf('alt="') - 2
            )
          : randomDefaultImage;
      return {
        author: `${item.creator.toUpperCase()} On ${item.pubDate.substring(
          0,
          item.pubDate.length - 15
        )}`,
        category: 'official',
        featured: false,
        path: '/',
        image: image.includes('flywheelsites.com') ? randomDefaultImage : image,
        link: item.link,
        title: item.title.toUpperCase(),
        timestamp: Date.now(),
        stream: false,
      };
    });

    let hasNewPost = false;

    const allPostsInDB = await this.client.providers.default
      .getAll('posts')
      .catch(() => null);

    const allOfficialPosts = allPostsInDB.filter(
      (post: any) => post.category === 'official'
    );

    for (const news of officialNews) {
      const isNew = allOfficialPosts.find(
        (post: any) => post.title.toUpperCase() === news.title
      );
      if (isNew) continue;

      hasNewPost = true;
    }
    
    if (!hasNewPost) return null;
    console.log('Updating db with official rss task.');
    // Deletes all the old posts in the database
    for (const news of allOfficialPosts)
      await this.client.providers.default
        .delete('posts', news.id)
        .catch(() => null);
    // Update the database with the new data
    for (const news of officialNews)
      await this.client.providers.default
        .create('posts', news.id, news)
        .catch(() => null);

    // Tell netlify to rebuild the website if the db was updated
    await fetch(config.netlifyUpdateWebhook, { method: 'POST' });

    return null;
  }

  async init(): Promise<any> {
    // If reminder task doesnt exist on startup create it every 10 minutes
    if (!this.client.schedule.tasks.find((t) => t.taskName === 'officialRSS'))
      this.client.schedule.create('officialRSS', '*/1 * * * *');
    return null;
  }
}
