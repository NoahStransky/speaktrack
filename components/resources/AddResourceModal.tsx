'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';

type Resource = { id?: string; type: string; title: string; url: string; content: string; tags: string };

export default function AddResourceModal({ open, onClose, onSave, editResource }: {
  open: boolean; onClose: () => void; onSave: () => void; editResource: Resource | null;
}) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => { editResource ? form.setFieldsValue(editResource) : form.resetFields(); }, [editResource, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = editResource?.id ? `/api/resources/${editResource.id}` : '/api/resources';
      const method = editResource?.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      if (res.ok) { message.success(editResource ? 'Updated!' : 'Added!'); onSave(); onClose(); form.resetFields(); }
      else { message.error('Failed to save'); }
    } catch { message.error('Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <Modal title={editResource ? 'Edit Resource' : 'Add Resource'} open={open} onCancel={onClose} onOk={() => form.submit()} confirmLoading={loading}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ type: 'link' }}>
        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select><Select.Option value="link">🔗 Link</Select.Option><Select.Option value="phrase">📝 Phrase</Select.Option><Select.Option value="shadowing">🎙️ Shadowing Material</Select.Option></Select>
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}><Input placeholder="e.g., 'How great leaders inspire action'" /></Form.Item>
        <Form.Item name="url" label="URL"><Input placeholder="https://..." /></Form.Item>
        <Form.Item name="content" label="Content / Phrase"><Input.TextArea rows={3} placeholder="The phrase, quote, or notes..." /></Form.Item>
        <Form.Item name="tags" label="Tags"><Input placeholder="ted, motivation (comma separated)" /></Form.Item>
      </Form>
    </Modal>
  );
}
