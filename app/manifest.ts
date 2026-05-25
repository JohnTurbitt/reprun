import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ocht",
    short_name: "Ocht",
    description:
      "Hybrid race split analyzer for finding time leaks and realistic next targets.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf2",
    theme_color: "#0a1711",
    icons: [
      {
        src: "/brand/ocht-mark.png",
        sizes: "1024x1024",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
