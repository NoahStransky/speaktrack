import { Skeleton, Card, Row, Col } from 'antd';

export function DashboardSkeleton() {
  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={12} sm={6} key={i}><Card><Skeleton active paragraph={{ rows: 1 }} /></Card></Col>
        ))}
      </Row>
      <Card style={{ marginBottom: 24 }}><Skeleton active paragraph={{ rows: 4 }} /></Card>
      <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
    </>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return <>{Array.from({ length: count }, (_, i) => <Card key={i} style={{ marginBottom: 12 }}><Skeleton active /></Card>)}</>;
}
