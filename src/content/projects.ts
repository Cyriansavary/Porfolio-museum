import * as BABYLON from "babylonjs";

import { PLAYER_HEIGHT, ROOM_OFFSET } from "../core/constants";
import type { AppLanguage, ProjectData, ProjectTextContent } from "../core/types";

export const projects: ProjectData[] = [
  {
    id: "survivorSlime",
    title: "Survivor Slime",
    subtitle: "FPS roguelike a vagues sous Unreal Engine 5",
    description:
      "FPS roguelike base sur des vagues d'ennemis dans lequel le joueur incarne un agent municipal intergalactique charge de nettoyer des zones infectees par une matiere vivante instable.\n\nCore loop\n- entrer dans une zone\n- survivre aux vagues de slimes\n- gerer les merges ennemis\n- recuperer recompenses et progression\n- encaisser l'escalade de difficulte jusqu'a l'extraction ou la mort\n\nMecanique cle - Merge system\n- 3 slimes identiques et de meme power fusionnent\n- la puissance evolue par paliers (1 -> 4 -> 16 -> ...)\n- la taille, les HP et le niveau de menace augmentent\n- un cooldown de merge protege la lisibilite du systeme\n\nA la mort d'un slime fusionne\n- spawn de A slimes gris\n- ces slimes gris ne fusionnent pas\n- ils servent de fallback vers l'etat de base",
    engine: "Unreal Engine 5",
    focus: "Merge system, horde combat, architecture IA scalable, roguelike loop",
    context: "Projet de fin d'etude de master",
    role: "Gameplay programmer, AI architecture, combat systems, VFX gameplay",
    year: "2025/2026",
    stack: "UE5, Blueprints, Behavior Trees, NavMesh, Niagara, optimisation",
    atmosphere:
      "Piliers du gameplay\n- escalade systemique: merge -> menace exponentielle\n- lisibilite et controle: VFX clairs, comportements distincts\n- gameplay nerveux: FPS rapide et gestion de horde\n- rejouabilite roguelike\n\nArchitecture IA\n- BP_EnemyMain derive de Character\n- navigation via NavMesh\n- Behavior Tree simple avec une task Move unique\n- chaque slime decide comment se deplacer: crawl, jump, super jump, dash ou glide selon sa variante\n\nRefonte du systeme ennemi\n- passage a une architecture scalable\n- resolution des problemes de physique et de navigation\n- hop system propre via LaunchCharacter, OnLanded et timers\n- Mega Jump AOE avec preview Niagara, impact et knockback joueur\n- VFX lisibles et performants sans tick global",
    accent: "Exposition 01",
    color: new BABYLON.Color3(0.2, 0.95, 0.65),
    position: new BABYLON.Vector3(-ROOM_OFFSET, 0, -ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(-10.8, PLAYER_HEIGHT, -10.8),
  },
  {
    id: "fantasyMobile",
    title: "Fantasy Mobile Multiplayer",
    subtitle: "Jeu medieval-fantasy multijoueur pense pour mobile",
    description:
      "Un projet centre sur la replication, l'interface et les contraintes de performance, avec une attention particuliere portee a la fluidite d'experience sur des appareils limites.",
    engine: "Unreal Engine 5",
    focus: "Replication, UI, mobile optimisation",
    context: "Projet en equipe",
    role: "Gameplay programmer / UI / reseau",
    year: "2024-2025",
    stack: "UE5, replication, widgets, profiling",
    atmosphere:
      "L'enjeu etait de garder une sensation de monde partage tout en preservant de la clarte et une bonne tenue framerate sur mobile.",
    accent: "Exposition 02",
    color: new BABYLON.Color3(0.45, 0.7, 1.0),
    position: new BABYLON.Vector3(ROOM_OFFSET, 0, -ROOM_OFFSET),
    viewPosition: new BABYLON.Vector3(10.8, PLAYER_HEIGHT, -10.8),
  },
  {
    id: "vrCooking",
    title: "Back To The Kitchen",
    subtitle: "Jeu de cuisine multijoueur en VR sous Unity",
    description:
      "Projet etudiant realise en equipe de 4 pendant 2 semaines en avril 2023 pour apprendre a concevoir un jeu VR sous Unity.\n\nLe jeu reprend une boucle de cuisine cooperative centree sur la preparation et le service de burgers. Les joueurs doivent recuperer les ingredients, les couper, cuire la viande, assembler les recettes demandees puis envoyer les commandes avant la fin du timer.\n\nUn ecran affiche jusqu'a 4 commandes en simultane avec leur composition et le temps restant. Le restaurant propose 6 ingredients principaux: pain, tomate, fromage, viande, oignon et salade. Chaque ingredient doit etre prepare correctement avant l'assemblage, avec un workflow simple a lire mais efficace en multijoueur.",
    engine: "Unity",
    focus: "VR multiplayer, XR interactions, UX comfort, game loop",
    context: "Projet etudiant en equipe de 4 - 2 semaines",
    role: "Principalement en charge de la partie multijoueur",
    year: "Avril 2023",
    stack: "Unity, XR Interaction Toolkit, Photon PUN, sockets, prototypage",
    atmosphere:
      "Base technique\n- XR Interaction Toolkit comme base de controle\n- 2 modes de deplacement pour limiter le motion sickness: teleportation ou marche lente avec forte vignette\n- reglage dynamique de la hauteur camera\n- interactions diegetiques dans le monde via boutons 3D et leviers\n- multijoueur gere avec Photon Unity Networking\n\nMon apport principal\n- mise en place de la partie multijoueur\n- synchronisation des joueurs en salle\n- representation reseau des mains et de la tete avec toque de chef\n- support de la cooperation autour des stations et objets partages\n\nDetails de gameplay\n- commandes generees aleatoirement avec entre 2 et 5 ingredients en plus du pain\n- usage de nombreux sockets pour empiler correctement les ingredients, poser la viande dans la poele, la poele sur le feu et l'assiette sur le comptoir",
    accent: "Exposition 03",
    color: new BABYLON.Color3(1.0, 0.65, 0.25),
    position: new BABYLON.Vector3(-17, 0, 17),
    viewPosition: new BABYLON.Vector3(-12.8, PLAYER_HEIGHT, 12.8),
  },
  {
    id: "drivingSim",
    title: "Ultra Realistic Driving Simulator",
    subtitle: "Simulation de conduite temps reel sur rig physique",
    description:
      "Un projet professionnel fortement oriente simulation, hardware, stabilite et performances. Une partie des medias reste non partageable mais l'experience technique est centrale.",
    engine: "Unreal Engine",
    focus: "Simulation, hardware, performance, pipeline",
    context: "Projet professionnel / NDA",
    role: "Programmation gameplay temps reel",
    year: "2025-2026",
    stack: "UE, pipeline, hardware IO, optimisation",
    atmosphere:
      "Le coeur du travail consistait a faire tenir ensemble precision, robustesse et ressenti credible sur une installation physique exigeante.",
    accent: "Exposition 04",
    color: new BABYLON.Color3(1.0, 0.35, 0.35),
    position: new BABYLON.Vector3(42, 0, 42),
    viewPosition: new BABYLON.Vector3(15.8, PLAYER_HEIGHT, 15.8),
  },
];

export const projectTextByLanguage: Record<
  AppLanguage,
  Record<string, ProjectTextContent>
> = {
  fr: {
    survivorSlime: {
      title: "Survivor Slime",
      subtitle: "FPS roguelike a vagues sous Unreal Engine 5",
      description:
        "FPS roguelike base sur des vagues d'ennemis dans lequel le joueur incarne un agent municipal intergalactique charge de nettoyer des zones infectees par une matiere vivante instable.\n\nCore loop\n- entrer dans une zone\n- survivre aux vagues de slimes\n- gerer les merges ennemis\n- recuperer recompenses et progression\n- encaisser l'escalade de difficulte jusqu'a l'extraction ou la mort\n\nMecanique cle - Merge system\n- 3 slimes identiques et de meme power fusionnent\n- la puissance evolue par paliers (1 -> 4 -> 16 -> ...)\n- la taille, les HP et le niveau de menace augmentent\n- un cooldown de merge protege la lisibilite du systeme\n\nA la mort d'un slime fusionne\n- spawn de A slimes gris\n- ces slimes gris ne fusionnent pas\n- ils servent de fallback vers l'etat de base",
      engine: "Unreal Engine 5",
      focus: "Merge system, horde combat, architecture IA scalable, roguelike loop",
      context: "Projet de fin d'etude de master",
      role: "Gameplay programmer, AI architecture, combat systems, VFX gameplay",
      year: "2025/2026",
      stack: "UE5, Blueprints, Behavior Trees, NavMesh, Niagara, optimisation",
      atmosphere:
        "Piliers du gameplay\n- escalade systemique: merge -> menace exponentielle\n- lisibilite et controle: VFX clairs, comportements distincts\n- gameplay nerveux: FPS rapide et gestion de horde\n- rejouabilite roguelike\n\nArchitecture IA\n- BP_EnemyMain derive de Character\n- navigation via NavMesh\n- Behavior Tree simple avec une task Move unique\n- chaque slime decide comment se deplacer: crawl, jump, super jump, dash ou glide selon sa variante\n\nRefonte du systeme ennemi\n- passage a une architecture scalable\n- resolution des problemes de physique et de navigation\n- hop system propre via LaunchCharacter, OnLanded et timers\n- Mega Jump AOE avec preview Niagara, impact et knockback joueur\n- VFX lisibles et performants sans tick global",
      accent: "Exposition 01",
    },
    fantasyMobile: {
      title: "Fantasy Mobile Multiplayer",
      subtitle: "Jeu medieval-fantasy multijoueur pense pour mobile",
      description:
        "Un projet centre sur la replication, l'interface et les contraintes de performance, avec une attention particuliere portee a la fluidite d'experience sur des appareils limites.",
      engine: "Unreal Engine 5",
      focus: "Replication, UI, mobile optimisation",
      context: "Projet en equipe",
      role: "Gameplay programmer / UI / reseau",
      year: "2024-2025",
      stack: "UE5, replication, widgets, profiling",
      atmosphere:
        "L'enjeu etait de garder une sensation de monde partage tout en preservant de la clarte et une bonne tenue framerate sur mobile.",
      accent: "Exposition 02",
    },
    vrCooking: {
      title: "Back To The Kitchen",
      subtitle: "Jeu de cuisine multijoueur en VR sous Unity",
      description:
        "Projet etudiant realise en equipe de 4 pendant 2 semaines en avril 2023 pour apprendre a concevoir un jeu VR sous Unity.\n\nLe jeu reprend une boucle de cuisine cooperative centree sur la preparation et le service de burgers. Les joueurs doivent recuperer les ingredients, les couper, cuire la viande, assembler les recettes demandees puis envoyer les commandes avant la fin du timer.\n\nUn ecran affiche jusqu'a 4 commandes en simultane avec leur composition et le temps restant. Le restaurant propose 6 ingredients principaux: pain, tomate, fromage, viande, oignon et salade. Chaque ingredient doit etre prepare correctement avant l'assemblage, avec un workflow simple a lire mais efficace en multijoueur.",
      engine: "Unity",
      focus: "VR multiplayer, XR interactions, UX comfort, game loop",
      context: "Projet etudiant en equipe de 4 - 2 semaines",
      role: "Principalement en charge de la partie multijoueur",
      year: "Avril 2023",
      stack: "Unity, XR Interaction Toolkit, Photon PUN, sockets, prototypage",
      atmosphere:
        "Base technique\n- XR Interaction Toolkit comme base de controle\n- 2 modes de deplacement pour limiter le motion sickness: teleportation ou marche lente avec forte vignette\n- reglage dynamique de la hauteur camera\n- interactions diegetiques dans le monde via boutons 3D et leviers\n- multijoueur gere avec Photon Unity Networking\n\nMon apport principal\n- mise en place de la partie multijoueur\n- synchronisation des joueurs en salle\n- representation reseau des mains et de la tete avec toque de chef\n- support de la cooperation autour des stations et objets partages\n\nDetails de gameplay\n- commandes generees aleatoirement avec entre 2 et 5 ingredients en plus du pain\n- usage de nombreux sockets pour empiler correctement les ingredients, poser la viande dans la poele, la poele sur le feu et l'assiette sur le comptoir",
      accent: "Exposition 03",
    },
    drivingSim: {
      title: "Ultra Realistic Driving Simulator",
      subtitle: "Simulation de conduite temps reel sur rig physique",
      description:
        "Un projet professionnel fortement oriente simulation, hardware, stabilite et performances. Une partie des medias reste non partageable mais l'experience technique est centrale.",
      engine: "Unreal Engine",
      focus: "Simulation, hardware, performance, pipeline",
      context: "Projet professionnel / NDA",
      role: "Programmation gameplay temps reel",
      year: "2025-2026",
      stack: "UE, pipeline, hardware IO, optimisation",
      atmosphere:
        "Le coeur du travail consistait a faire tenir ensemble precision, robustesse et ressenti credible sur une installation physique exigeante.",
      accent: "Exposition 04",
    },
  },
  en: {
    survivorSlime: {
      title: "Survivor Slime",
      subtitle: "Wave-based FPS roguelike in Unreal Engine 5",
      description:
        "A wave-based FPS roguelike where the player acts as an intergalactic municipal agent sent to clean areas contaminated by unstable living matter.\n\nCore loop\n- enter an infected zone\n- survive incoming slime waves\n- manage enemy merges\n- earn rewards and progression\n- endure the difficulty ramp until extraction or death\n\nCore mechanic - Merge system\n- 3 identical slimes with the same power merge together\n- power escalates in tiers (1 -> 4 -> 16 -> ...)\n- size, HP and threat level increase\n- a merge cooldown preserves readability\n\nWhen a merged slime dies\n- A gray slimes spawn\n- those gray slimes cannot merge\n- they act as a fallback to the base state",
      engine: "Unreal Engine 5",
      focus: "Merge system, horde combat, scalable AI architecture, roguelike loop",
      context: "Master's final project",
      role: "Gameplay programmer, AI architecture, combat systems, gameplay VFX",
      year: "2025/2026",
      stack: "UE5, Blueprints, Behavior Trees, NavMesh, Niagara, optimization",
      atmosphere:
        "Gameplay pillars\n- systemic escalation: merge -> exponential threat\n- readability and control: clear VFX, distinct behaviors\n- intense gameplay: fast FPS combat and horde management\n- roguelike replayability\n\nAI architecture\n- BP_EnemyMain derived from Character\n- navigation through NavMesh\n- simple Behavior Tree with a single Move task\n- each slime decides how to move: crawl, jump, super jump, dash or glide depending on its variant\n\nEnemy system refactor\n- moved to a scalable architecture\n- solved physics and navigation issues\n- clean hop system through LaunchCharacter, OnLanded and timers\n- Mega Jump AOE with Niagara preview, impact and player knockback\n- readable and performant VFX without a global tick",
      accent: "Exhibit 01",
    },
    fantasyMobile: {
      title: "Fantasy Mobile Multiplayer",
      subtitle: "Medieval fantasy multiplayer game designed for mobile",
      description:
        "A project focused on replication, interface design and performance constraints, with special attention paid to a smooth experience on limited mobile devices.",
      engine: "Unreal Engine 5",
      focus: "Replication, UI, mobile optimization",
      context: "Team project",
      role: "Gameplay programmer / UI / networking",
      year: "2024-2025",
      stack: "UE5, replication, widgets, profiling",
      atmosphere:
        "The main challenge was to preserve a convincing shared-world feeling while keeping the experience readable and performant on mobile hardware.",
      accent: "Exhibit 02",
    },
    vrCooking: {
      title: "Back To The Kitchen",
      subtitle: "Multiplayer VR cooking game made in Unity",
      description:
        "Student project made by a team of 4 over 2 weeks in April 2023 to learn how to build a VR game in Unity.\n\nThe experience is built around a cooperative burger-serving loop. Players gather ingredients, cut them, cook the meat, assemble the burgers in the correct order, then serve them before the timer runs out.\n\nA screen displays up to 4 active orders with their recipe and remaining time. The kitchen uses 6 core ingredients: bread, tomato, cheese, meat, onion and lettuce. Each ingredient has to be prepared properly before assembly, creating a simple but readable cooperative workflow.",
      engine: "Unity",
      focus: "VR multiplayer, XR interactions, comfort UX, game loop",
      context: "Student team project - 4 people, 2 weeks",
      role: "Mainly responsible for the multiplayer side",
      year: "April 2023",
      stack: "Unity, XR Interaction Toolkit, Photon PUN, sockets, prototyping",
      atmosphere:
        "Technical foundation\n- XR Interaction Toolkit used as the controller base\n- 2 movement options to reduce motion sickness: teleport or slow walk with a strong vignette\n- adjustable camera height\n- diegetic world interactions through 3D buttons and wall levers\n- multiplayer handled with Photon Unity Networking\n\nMy main contribution\n- worked primarily on the multiplayer implementation\n- room connection and partner synchronization\n- networked player representation with 2 hands and a head wearing a chef hat\n- support for cooperation around shared stations and kitchen objects\n\nGameplay details\n- orders are generated randomly with bread plus 2 to 5 extra ingredients\n- heavy use of sockets to place ingredients on top of each other, meat in pans, pans on burners and dishes on the counter",
      accent: "Exhibit 03",
    },
    drivingSim: {
      title: "Ultra Realistic Driving Simulator",
      subtitle: "Real-time driving simulation on a physical rig",
      description:
        "A professional project heavily focused on simulation, hardware integration, stability and performance. Some media cannot be shared, but the technical experience is central.",
      engine: "Unreal Engine",
      focus: "Simulation, hardware, performance, pipeline",
      context: "Professional project / NDA",
      role: "Real-time gameplay programming",
      year: "2025-2026",
      stack: "UE, pipeline, hardware I/O, optimization",
      atmosphere:
        "The core challenge was making precision, robustness and believable feel coexist on a demanding physical installation.",
      accent: "Exhibit 04",
    },
  },
};
