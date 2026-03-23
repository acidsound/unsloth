// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

import type { ReactNode } from "react";

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
}

export interface LoraModelOption extends ModelOption {
  baseModel?: string;
  updatedAt?: number;
  source?: "training" | "exported";
  exportType?: "lora" | "merged" | "gguf";
}

export interface LocalModelOption extends ModelOption {
  path: string;
  source: "models_dir" | "hf_cache";
  updatedAt?: number | null;
}

export interface ModelSelectorChangeMeta {
  source: "hub" | "lora" | "exported" | "local";
  isLora: boolean;
  displayName?: string;
  ggufVariant?: string;
  isDownloaded?: boolean;
  expectedBytes?: number;
}

