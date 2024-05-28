import { basket } from "./basket.js";
import { initImagesRation } from "./common/index.js";
import { CATEGORY } from "./common/constants.js";

basket(CATEGORY).initBasket();

initImagesRation(CATEGORY);
