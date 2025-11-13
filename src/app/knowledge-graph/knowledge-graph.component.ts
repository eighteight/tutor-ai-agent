import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { N8nService } from '../n8n.service';
import { Router } from '@angular/router';
import { select } from 'd3-selection';
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force';
import { drag } from 'd3-drag';

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.component.html',
  styleUrls: ['./knowledge-graph.component.css']
})
export class KnowledgeGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graphContainer', { static: false }) graphContainer!: ElementRef;
  graphData: any = null;
  loading = true;

  constructor(private n8nService: N8nService, private router: Router) {}

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
    if (!this.graphData || !this.graphContainer) return;

    const container = this.graphContainer.nativeElement;
    select(container).selectAll('*').remove();

    const width = 800;
    const height = 600;

    const svg = select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Map edges to use actual node objects instead of indices
    const links = this.graphData.edges.map((edge: any) => ({
      source: this.graphData.nodes[edge.from],
      target: this.graphData.nodes[edge.to],
      label: edge.label
    }));

    const simulation = forceSimulation(this.graphData.nodes)
      .force('link', forceLink(links).distance(100))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Add clickable tooltip
    const tooltip = select('body').append('div')
      .attr('class', 'graph-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background', 'rgba(0,0,0,0.9)')
      .style('color', 'white')
      .style('padding', '12px')
      .style('border-radius', '8px')
      .style('font-size', '12px')
      .style('cursor', 'pointer')
      .style('border', '2px solid #4CAF50')
      .style('pointer-events', 'auto');

    const node = svg.append('g')
      .selectAll('circle')
      .data(this.graphData.nodes)
      .enter().append('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => d.type === 'course' ? '#4CAF50' : '#2196F3')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d: any) => {
        // Highlight node
        select(event.target).attr('r', 25).attr('stroke-width', 4);
        // Show clickable tooltip
        tooltip.style('opacity', 0.9);
        tooltip.html(`
          <div>
            <strong>${d.label}</strong><br/>
            <em>Type: ${d.type}</em><br/>
            <p style="margin: 8px 0; font-size: 11px;">${d.content}</p>
            <div style="text-align: center; margin-top: 8px; padding: 4px; background: #4CAF50; border-radius: 4px; font-weight: bold;">
              Click to start lesson →
            </div>
          </div>
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px')
          .on('click', () => {
            this.navigateToLesson(d.label);
            tooltip.style('opacity', 0);
          });
      })
      .on('mouseout', (event, d: any) => {
        // Reset node after delay to allow tooltip clicking
        setTimeout(() => {
          select(event.target).attr('r', 20).attr('stroke-width', 2);
          if (!tooltip.node()?.matches(':hover')) {
            tooltip.style('opacity', 0);
          }
        }, 100);
      })
      .on('click', (event, d: any) => {
        // Double-click to pin/unpin node
        if (d.fx !== null) {
          d.fx = null;
          d.fy = null;
          select(event.target).attr('stroke', '#fff');
        } else {
          d.fx = d.x;
          d.fy = d.y;
          select(event.target).attr('stroke', '#ff0000');
        }
      })
      .call(drag<SVGCircleElement, any>()
        .on('start', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
        }));

    const label = svg.append('g')
      .selectAll('text')
      .data(this.graphData.nodes)
      .enter().append('text')
      .text((d: any) => d.label)
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .style('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);

      label
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => d.y);
    });

    // Hide tooltip when clicking elsewhere
    select('body').on('click', () => {
      tooltip.style('opacity', 0);
    });
  }

  navigateToLesson(courseName: string) {
    // Navigate to chat with the selected course
    this.router.navigate(['/chat'], { queryParams: { course: courseName } });
  }
}