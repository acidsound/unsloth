// SPDX-License-Identifier: AGPL-3.0-only
// Copyright 2026-present the Unsloth AI Inc. team. All rights reserved. See /studio/LICENSE.AGPL-3.0

"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlatformStore } from "@/config/env";
import { listLocalModels } from "@/features/training/api/models-api";
import { cn } from "@/lib/utils";
import {
  ArrowDown01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import {
  HubModelPicker,
  LocalModelPicker,
  LoraModelPicker,
} from "./model-selector/pickers";
import type {
  LoraModelOption,
  LocalModelOption,
  ModelOption,
  ModelSelectorChangeMeta,
} from "./model-selector/types";

export type {
  LoraModelOption,
  LocalModelOption,
  ModelOption,
  ModelSelectorChangeMeta,
} from "./model-selector/types";

interface ModelSelectorProps {
  models: ModelOption[];
  loraModels?: LoraModelOption[];
  value?: string;
  defaultValue?: string;
  activeGgufVariant?: string | null;
  onValueChange?: (value: string, meta: ModelSelectorChangeMeta) => void;
  onEject?: () => void;
  variant?: "outline" | "ghost" | "muted";
  size?: "sm" | "default" | "lg";
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerDataTour?: string;
  contentDataTour?: string;
}

function ModelSelectorTrigger({
  currentModel,
  isLoaded,
  variant = "outline",
  size = "default",
  className,
  dataTour,
}: {
  currentModel?: ModelOption;
  isLoaded: boolean;
  variant?: "outline" | "ghost" | "muted";
  size?: "sm" | "default" | "lg";
  className?: string;
  dataTour?: string;
}) {
  return (
    <PopoverTrigger asChild={true}>
      <button
        type="button"
        data-tour={dataTour}
        className={cn(
          "flex items-center gap-2 transition-colors",
          variant === "outline" &&
            "rounded-full border border-border/60 hover:bg-accent",
          variant === "ghost" && "rounded-md hover:bg-accent",
          variant === "muted" && "rounded-md bg-muted hover:bg-muted/80",
          size === "sm" && "h-8 px-3 text-xs",
          size === "default" && "h-9 px-3.5 text-sm",
          size === "lg" && "h-10 px-4 text-sm",
          className,
        )}
      >
        {isLoaded && (
          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
        )}
        <span className={isLoaded ? "text-foreground" : "text-muted-foreground"}>
          {currentModel?.name ?? "Select model..."}
        </span>
        {currentModel?.description && (
          <span className="text-muted-foreground text-xs">
            {currentModel.description}
          </span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3 shrink-0 text-muted-foreground"
        />
      </button>
    </PopoverTrigger>
  );
}

function ModelSelectorContent({
  models,
  localModels,
  isLoadingLocalModels,
  localModelsError,
  loraModels,
  value,
  onSelect,
  onEject,
  className,
  dataTour,
}: {
  models: ModelOption[];
  localModels: LocalModelOption[];
  isLoadingLocalModels: boolean;
  localModelsError: string | null;
  loraModels: LoraModelOption[];
  value?: string;
  onSelect: (id: string, meta: ModelSelectorChangeMeta) => void;
  onEject?: () => void;
  className?: string;
  dataTour?: string;
}) {
  const hasSelection = Boolean(value);
  const chatOnly = usePlatformStore((s) => s.isChatOnly());

  return (
    <PopoverContent
      align="start"
      data-tour={dataTour}
      className={cn(
        "w-[min(440px,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] min-w-0 gap-0 p-2",
        className,
      )}
    >
      <Tabs defaultValue="hub" className="w-full">
        <TabsList className="mb-2 w-full">
          <TabsTrigger value="local">Local GGUF</TabsTrigger>
          <TabsTrigger value="hub">Hub models</TabsTrigger>
          {!chatOnly ? <TabsTrigger value="lora">Fine-tuned</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="local" className="m-0">
          <LocalModelPicker
            localModels={localModels}
            value={value}
            onSelect={onSelect}
            loading={isLoadingLocalModels}
            error={localModelsError}
          />
        </TabsContent>

        <TabsContent value="hub" className="m-0">
          <HubModelPicker models={models} value={value} onSelect={onSelect} />
        </TabsContent>

        {!chatOnly ? (
          <TabsContent value="lora" className="m-0">
            <LoraModelPicker
              loraModels={loraModels}
              value={value}
              onSelect={onSelect}
            />
          </TabsContent>
        ) : null}
      </Tabs>

      {hasSelection && onEject ? (
        <div className="mt-2 border-t border-border/70 pt-2">
          <button
            type="button"
            onClick={onEject}
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
            title="Eject model"
          >
            <HugeiconsIcon icon={Logout01Icon} className="size-3.5" />
            Eject loaded model
          </button>
        </div>
      ) : null}
    </PopoverContent>
  );
}

export function ModelSelector({
  models,
  loraModels = [],
  value,
  defaultValue,
  activeGgufVariant,
  onValueChange,
  onEject,
  variant = "outline",
  size = "default",
  className,
  contentClassName,
  open: controlledOpen,
  onOpenChange,
  triggerDataTour,
  contentDataTour,
}: ModelSelectorProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const [localModels, setLocalModels] = useState<LocalModelOption[]>([]);
  const [isLoadingLocalModels, setIsLoadingLocalModels] = useState(false);
  const [localModelsError, setLocalModelsError] = useState<string | null>(null);

  const selected = value ?? uncontrolled;
  const isLoaded = selected !== "";

  useEffect(() => {
    if (!open) return;

    const abortController = new AbortController();
    setIsLoadingLocalModels(true);
    setLocalModelsError(null);

    listLocalModels(abortController.signal)
      .then((items) => {
        const next = items
          .filter(
            (item) =>
              item.source === "models_dir" &&
              item.path.toLowerCase().endsWith(".gguf"),
          )
          .map<LocalModelOption>((item) => ({
            id: item.id,
            name: item.display_name,
            path: item.path,
            source: item.source,
            updatedAt: item.updated_at ?? null,
          }));
        setLocalModels(next);
      })
      .catch((error) => {
        if (abortController.signal.aborted) return;
        setLocalModelsError(
          error instanceof Error ? error.message : "Failed to load local models",
        );
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingLocalModels(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [open]);

  const optionById = useMemo(() => {
    const all = new Map<string, ModelOption>();
    for (const model of models) {
      all.set(model.id, model);
    }
    for (const localModel of localModels) {
      const description =
        localModel.path.toLowerCase().endsWith(".gguf") ? "Local GGUF" : "Local";
      all.set(localModel.id, {
        ...localModel,
        description,
      });
    }
    for (const lora of loraModels) {
      const displayName = lora.name.includes("/")
        ? lora.name.split("/")[0].trim()
        : lora.name;
      const isExported = lora.source === "exported";
      const isMerged = lora.exportType === "merged";
      const tag = isExported
        ? isMerged
          ? "Merged Exported"
          : "LoRA"
        : "LoRA";
      all.set(lora.id, {
        ...lora,
        name: displayName,
        description: tag,
      });
    }
    return all;
  }, [localModels, loraModels, models]);

  const currentModel = useMemo(() => {
    if (!selected) return undefined;
    const found = optionById.get(selected);
    if (activeGgufVariant) {
      const description = `GGUF ${activeGgufVariant}`;
      return found
        ? { ...found, description }
        : { id: selected, name: selected, description };
    }
    return found ?? { id: selected, name: selected };
  }, [selected, optionById, activeGgufVariant]);

  function handleSelect(id: string, meta: ModelSelectorChangeMeta) {
    if (onValueChange) {
      onValueChange(id, meta);
    } else {
      setUncontrolled(id);
    }
    setOpen(false);
  }

  function handleEject() {
    onEject?.();
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ModelSelectorTrigger
        currentModel={currentModel}
        isLoaded={isLoaded}
        variant={variant}
        size={size}
        className={className}
        dataTour={triggerDataTour}
      />
      <ModelSelectorContent
        models={models}
        localModels={localModels}
        isLoadingLocalModels={isLoadingLocalModels}
        localModelsError={localModelsError}
        loraModels={loraModels}
        value={selected}
        onSelect={handleSelect}
        onEject={onEject ? handleEject : undefined}
        className={contentClassName}
        dataTour={contentDataTour}
      />
    </Popover>
  );
}

ModelSelector.Trigger = ModelSelectorTrigger;
ModelSelector.Content = ModelSelectorContent;
