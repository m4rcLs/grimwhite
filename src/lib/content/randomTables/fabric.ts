import { rollOn, type TableEntry } from "../moves/miracles/tables";
import { KNAVE_TABLES } from "./tableMap";

export const FABRIC: TableEntry[] = [
    "Alligator skin", " Jute",
    "Alpaca wool", " Lace",
    { generator: generateAnimalSkin }, "Lamb wool",
    "Badger skin", " Lambskin",
    "Bamboo weave", " Leather",
    "Barkcloth", "Leopard skin",
    "Bearskin", " Linen",
    "Beaver skin", "Lion skin",
    "Blanket", "Llama wool",
    "Brass", " Mail",
    "Brocade", " Mesh",
    "Bronze", "Mink fur",
    "Burlap", "Mink skin",
    "Calfskin", "Mohair wool",
    "Calico", { generator: generateMonsterSkin },
    "Camel hair", " Muslin",
    "Camel skin", " Oilcloth",
    "Canvas", "Ostrich skin",
    "Cashmere wool", "Otter skin",
    "Cat hair", " Patchwork",
    "Chambray", "Pig skin",
    "Chiffon", " Quilt",
    "Chino", "Rabbit skin",
    "Coconut fiber", " Rags",
    "Copper", "Rat skin",
    "Corduroy", "Reindeer skin",
    "Cotton", " Sailcloth",
    "Cow skin", " Satin",
    "Crepe", " Sealskin",
    "Damask", " Seersucker",
    "Deerskin", " Sheepskin",
    "Denim", "Sheep wool",
    "Dog hair", " Silk",
    "Eel skin", "Snake skin",
    "Felt", "Squirrel skin",
    "Fish skin", " Steel",
    "Fishnet", "Stingray skin",
    "Flannel", " Suede",
    "Flax", " Taffeta",
    "Fleece", " Tartan",
    "Fox skin", " Terrycloth",
    "Gauze", "Tiger skin",
    "Gingham", " Tinsel",
    "Goatskin", " Tulle",
    "Grass weave", " Tweed",
    "Hemp", " Twill",
    "Herringbone", " Velour",
    "Horse hair", " Velvet",
    "Horse skin", "Wolf skin",
    "Iron", "Yak wool",
]

function generateAnimalSkin() {
    return rollOn("animal", KNAVE_TABLES)
}


function generateMonsterSkin() {
    return rollOn("monster", KNAVE_TABLES)
}