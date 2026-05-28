'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { Typography, Button, Select, Space, Empty, Input } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ResourceCard from '@/components/resources/ResourceCard';
import AddResourceModal from '@/components/resources/AddResourceModal';

const { Title, Text } = Typography;

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editResource, setEditResource] = useState<any>(null);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [searchTag, setSearchTag] = useState('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterType) params.set('type', filterType);
    if (searchTag) params.set('tag', searchTag);
    const res = await fetch(`/api/resources?${params}`);
    setResources(await res.json());
    setLoading(false);
  }, [filterType, searchTag]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const deleteResource = async (id: string) => { await fetch(`/api/resources/${id}`, { method: 'DELETE' }); fetchResources(); };
  const openEdit = (resource: any) => { setEditResource(resource); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditResource(null); };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Resource Library</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Add Resource</Button>
      </div>
      <Space style={{ marginBottom: 16 }} wrap>
        <Select placeholder="All types" allowClear style={{ width: 160 }} value={filterType} onChange={setFilterType}>
          <Select.Option value="link">🔗 Links</Select.Option><Select.Option value="phrase">📝 Phrases</Select.Option><Select.Option value="shadowing">🎙️ Shadowing</Select.Option>
        </Select>
        <Input placeholder="Search by tag..." prefix={<SearchOutlined />} value={searchTag} onChange={(e) => setSearchTag(e.target.value)} style={{ width: 200 }} />
      </Space>

      {loading ? <Text>Loading...</Text>
        : resources.length === 0 ? <Empty description="No resources yet. Add your first one!" />
        : resources.map((r) => <ResourceCard key={r.id} resource={r} onDelete={deleteResource} onEdit={openEdit} />)}

      <AddResourceModal open={modalOpen} onClose={closeModal} onSave={fetchResources} editResource={editResource} />
    </div>
  );
}
