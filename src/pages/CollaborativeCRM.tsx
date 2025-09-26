import React from 'react';
import HybridLayout from '@/components/HybridLayout';
import { CollaborativeCRM as CollaborativeCRMComponent } from '@/components/collaboration/CollaborativeCRM';

export default function CollaborativeCRM() {
  return (
    <HybridLayout>
      <div className="space-y-6">
        <CollaborativeCRMComponent />
      </div>
    </HybridLayout>
  );
}