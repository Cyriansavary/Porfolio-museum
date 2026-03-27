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
    title: "VR Cooking Multiplayer",
    subtitle: "Jeu de cuisine coop en VR sous Unity",
    description:
      "Une production orientee interactions, objets manipulables et cooperation, ou la clarte UX compte autant que la sensation physique des gestes en VR.",
    engine: "Unity",
    focus: "VR interactions, multiplayer, UX",
    context: "Projet en equipe",
    role: "Gameplay / interactions / integration",
    year: "2023-2024",
    stack: "Unity, XR, interactions, prototypage",
    atmosphere:
      "La reussite passait par une gestuelle satisfaisante et par une lecture immediate des outils, ingredients et actions en espace partage.",
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
      title: "VR Cooking Multiplayer",
      subtitle: "Jeu de cuisine coop en VR sous Unity",
      description:
        "Une production orientee interactions, objets manipulables et cooperation, ou la clarte UX compte autant que la sensation physique des gestes en VR.",
      engine: "Unity",
      focus: "VR interactions, multiplayer, UX",
      context: "Projet en equipe",
      role: "Gameplay / interactions / integration",
      year: "2023-2024",
      stack: "Unity, XR, interactions, prototypage",
      atmosphere:
        "La reussite passait par une gestuelle satisfaisante et par une lecture immediate des outils, ingredients et actions en espace partage.",
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
      title: "VR Cooking Multiplayer",
      subtitle: "Co-op VR cooking game in Unity",
      description:
        "A production centered on interactions, manipulable objects and cooperation, where UX clarity matters as much as the physical feel of gestures in VR.",
      engine: "Unity",
      focus: "VR interactions, multiplayer, UX",
      context: "Team project",
      role: "Gameplay / interactions / integration",
      year: "2023-2024",
      stack: "Unity, XR, interactions, prototyping",
      atmosphere:
        "Success relied on satisfying gesture design and immediate readability for tools, ingredients and player actions inside a shared space.",
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
