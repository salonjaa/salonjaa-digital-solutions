/**
 * Single source of truth for brand name, tagline, and everyone's contact
 * details. Import from here rather than hardcoding these values anywhere
 * else in the app.
 */

export const site = {
  name: "Salonjaa Digital Solutions",
  shortName: "Salonjaa",
  tagline: "We design. We market. You thrive.",
  url: "https://www.salonjaa.com",
  description:
    "Salonjaa Digital Solutions is a two-person freelance studio in Bhubaneswar building custom, responsive websites, e-commerce & business portals, SEO, and domain & hosting management — one developer, one marketer, no hand-offs.",
  ogDescription:
    "Custom websites, e-commerce portals, SEO and domain/hosting management from a two-person freelance studio in Bhubaneswar, India.",
  address: {
    line1: "Lane-5, Satya Sai Enclave, Khandagiri",
    line2: "Bhubaneswar, Odisha, India",
    full: "Lane-5, Satya Sai Enclave, Khandagiri, Bhubaneswar, Odisha, India",
  },
} as const;

export const team = {
  kumar: {
    name: "Kumar Prasannajit Sahu",
    role: "Chief Full Stack Developer",
    phone: "+91 81146 16084",
    phoneHref: "tel:+918114616084",
    email: "kumarprasannajitsahu@gmail.com",
    whatsapp: "https://wa.me/918114616084",
    github: "https://github.com/Kumar-Prasannajit",
    linkedin: "https://linkedin.com/in/kumar-prasannajit-sahu",
    resume: "/files/Kumar-Prasannajit-Sahu-Resume.pdf",
    photo: "/images/team/kumar-prasannajit-sahu.jpg",
  },
  saroj: {
    name: "Saroj Kumar Sahu",
    role: "Marketing & PR Lead · CMO",
    phone: "+91 90408 69749",
    phoneHref: "tel:+919040869749",
    email: "Sarojeditor@hotmail.com",
    whatsapp: "https://wa.me/919040869749",
    photo: "/images/team/saroj-kumar-sahu.jpg",
  },
  snehanjali: {
    name: "Snehanjali Sahu",
    role: "Coordinator",
    phone: "+91 81170 16550",
    phoneHref: "tel:+918117016550",
    email: "snehanjalisahu515@gmail.com",
  },
} as const;
