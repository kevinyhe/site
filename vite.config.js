import { resolve } from "path";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src");

const rewriteSlashToIndexHtml = () => {
	return {
		name: "rewrite-slash-to-index-html",
		apply: "serve",
		enforce: "post",
		configureServer(server) {
			server.middlewares.use("/", (req, _, next) => {
				if (req.url === "/") {
					req.url = "/index.html";
				}
				next();
			});
		},
	};
};

export default defineConfig({
	root,
	appType: "mpa", // disable history fallback
	plugins: [rewriteSlashToIndexHtml()],
	build: {
		rollupOptions: {
			input: {
				main: resolve(root, "index.html"),
				contact: resolve(root, "contact/index.html"),
			},
		},
	},
});
