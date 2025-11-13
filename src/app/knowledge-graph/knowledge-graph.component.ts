import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { N8nService } from '../n8n.service';

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.css']
})
export class KnowledgeGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvas!: ElementRef<HTMLCanvasElement>;
  graphData: any = null;
  loading = true;
  private ctx!: CanvasRenderingContext2D;
  private nodes: any[] = [];
  private edges: any[] = [];

  constructor(private n8nService: N8nService) {}

  ngOnInit() {
    this.loadKnowledgeGraph();
  }

  ngAfterViewInit() {
    if (this.graphData) {
      this.renderGraph();
    }
  }

  loadKnowledgeGraph() {
    this.n8nService.getKnowledgeGraph().subscribe({
      next: (data) => {
        this.graphData = data;
        this.loading = false;
        setTimeout(() => this.renderGraph(), 0);
      },
      error: (error) => {
        console.error('Failed to load knowledge graph:', error);
        this.loading = false;
      }
    });
  }

  renderGraph() {
    if (!this.graphData || !this.canvas) return;

    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;

    // Position nodes in a circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 200;
    
    this.nodes = this.graphData.nodes.map((node: any, i: number) => {
      const angle = (i / this.graphData.nodes.length) * 2 * Math.PI;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    this.edges = this.graphData.edges.map((edge: any) => ({
      ...edge,
      source: this.nodes[edge.from],
      target: this.nodes[edge.to]
    }));

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, 800, 600);

    // Draw edges
    this.ctx.strokeStyle = '#999';
    this.ctx.lineWidth = 2;
    this.edges.forEach(edge => {
      this.ctx.beginPath();
      this.ctx.moveTo(edge.source.x, edge.source.y);
      this.ctx.lineTo(edge.target.x, edge.target.y);
      this.ctx.stroke();
    });

    // Draw nodes
    this.nodes.forEach(node => {
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
      this.ctx.fillStyle = node.type === 'course' ? '#4CAF50' : '#2196F3';
      this.ctx.fill();
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Draw labels
      this.ctx.fillStyle = 'white';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(node.label, node.x, node.y + 4);
    });
  }
}